import { DefaultMap, DefaultObjectMap, ObjectMap } from './Map.js';
import { notnull, chday, dateDayDiff, dateTimeUntil, timePerDay, timePerMinute, timePerHour, formatHms } from './util.js';

export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;

export interface Employee {
    department: string,
    name: string,
    no: string,
    idNumber: [string, number],
};

export enum WarningKind {
    ForgotToBadge,
}

export interface Warning {
    kind: WarningKind;
    dateEnd: Date;
    dateStart: Date;
}

export interface WorkTime {
    workedFor: number;
    warnings: Warning[];
}

export function getWarningMessage(w: Warning) {
    switch (w.kind) {
        case WarningKind.ForgotToBadge:
            return `employee entered at ${w.dateStart.toLocaleString()}, worked until ${w.dateEnd.toLocaleString()} (for ${formatHms(w.dateEnd.getTime() - w.dateStart.getTime())}): likely forgot to badge`;
    }
}

export function parseWorkerChecks(rows: string[][]) {
    const workingHours = new DefaultObjectMap<Employee, Date[], string>(() => [], JSON.stringify, JSON.parse);
    for (const [department, name, no, dateTime, /* locationId */, idNumber, /* verifyCode */, /* cardNo */] of rows) {
        workingHours
            .get({ department: department, name: name, no: no, idNumber: parseIdNumber(idNumber) })
            .push(parseDateTime(dateTime));
    }
    return workingHours;
}

export function getResults(workerChecks: Map<Employee, Date[]>)
{
    const result = new ObjectMap<Employee, DefaultMap<Date, WorkTime>, string>(JSON.stringify, JSON.parse);
    for (const [emp, checks] of workerChecks.entries()) {
        result.set(emp, getWorkTime(emp, checks));
    }
    return result;
}

/**
 * @return A 2-uple of the work time per date only, and the warnings per date only.
 */
export function getWorkTime(emp: Employee, checks: Date[]) {
    function dateOnlyKtop(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date: string) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }

    const workTimes = new DefaultObjectMap<Date, WorkTime, string>(() => ({ workedFor: 0, warnings: [] }), dateOnlyKtop, dateOnlyPtok);

    let working = false;
    let lastClockIn: Date = null!;
    for (let i = 0; i < checks.length; ++i) {
        const d = checks[i];

        if (working) {
            let dayDiff = dateDayDiff(d, lastClockIn);
            if (dayDiff) {
                // make previous work until 23:59
                workTimes.get(lastClockIn).workedFor += dateTimeUntil(lastClockIn, 23, 59, 0);

                // account for full 24hours of work
                while (dayDiff > 1) {
                    chday(lastClockIn, 1);
                    workTimes.get(lastClockIn).workedFor += timePerDay - timePerMinute; // work full days 23:59
                    dayDiff--;
                }

                // make next work since midnight
                lastClockIn = new Date(d);
                lastClockIn.setHours(0, 0, 0);
                working = true;
            }
            workTimes.get(d).workedFor += d.getTime() - lastClockIn.getTime();
        } else {
            // Check for inconsistencies
            if (i + 1 < checks.length) {
                const dnext = checks[i + 1];
                const diff = dnext.getTime() - d.getTime();

                if (diff < minWorkTime) {
                    // unreported as it is insignificant
                    continue;
                }
                else if (diff > maxWorkTime) {
                    workTimes.get(dnext).warnings.push({
                        kind: WarningKind.ForgotToBadge,
                        dateStart: d,
                        dateEnd: dnext,
                    });
                    continue;
                }
            }

            lastClockIn = d;
        }
        working = !working;
    }

    return workTimes;
}

function parseDateTime(input: string) {
    const pattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const [, D, M, Y, h, m, s] = notnull(pattern.exec(input), 'failed to parse date time');
    return new Date(+Y, +M - 1, +D, +h, +m, +s);
}

function parseIdNumber(input: string): [string, number] {
    const pattern = /^([A-Z]+)(\d*)$/;
    const [, c, n] = notnull(pattern.exec(input), 'failed to parse id number');
    return [c, +n];
}
