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

export interface Shift {
    workTime: number;
    warning?: Warning;
}

export function getWarningMessage(w: Warning) {
    switch (w.kind) {
        case WarningKind.ForgotToBadge:
            return `employee entered at ${w.dateStart.toLocaleString()}, worked until ${w.dateEnd.toLocaleString()} (for ${formatHms(w.dateEnd.getTime() - w.dateStart.getTime())}): likely forgot to badge exit`;
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

export function getResults(workerChecks: Map<Employee, Date[]>) {
    const result = new ObjectMap<Employee, DefaultMap<Date, Shift>, string>(JSON.stringify, JSON.parse);
    for (const [emp, checks] of workerChecks.entries()) {
        result.set(emp, getShifts(/* emp,  */checks));
    }
    return result;
}

/**
 * @return A 2-uple of the work time per date only, and the warnings per date only.
 */
function getShifts(/* emp: Employee,  */checks: Date[]) {
    function dateOnlyKtop(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date: string) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }

    const shifts = new DefaultObjectMap<Date, Shift, string>(() => ({ workTime: 0 }), dateOnlyKtop, dateOnlyPtok);

    let working = false;
    let lastClockIn: Date = null!;
    for (let i = 0; i < checks.length; ++i) {
        const d = checks[i];
        if (working) {
            // d is a clockout
            const workTime = d.getTime() - lastClockIn.getTime();
            if (workTime >= minWorkTime) {
                if (workTime <= maxWorkTime) {
                    let dayDiff = dateDayDiff(d, lastClockIn);
                    if (dayDiff) {
                        // make previous work until 23:59
                        shifts.get(lastClockIn).workTime += dateTimeUntil(lastClockIn, 23, 59, 0);

                        // account for full 24hours of work
                        while (dayDiff-- > 1) {
                            chday(lastClockIn, 1);
                            shifts.get(lastClockIn).workTime += timePerDay - timePerMinute; // work full days 23:59
                        }

                        // make next work since midnight
                        lastClockIn = new Date(d);
                        lastClockIn.setHours(0, 0, 0);
                    }
                    // lastClockIn may have changed so we need to recompuute the work time
                    shifts.get(d).workTime += d.getTime() - lastClockIn.getTime();
                } else {
                    const wt = shifts.get(d);
                    wt.workTime += maxWorkTime;
                    wt.warning = {
                        kind: WarningKind.ForgotToBadge,
                        dateStart: checks[i - 1],
                        dateEnd: d,
                    };
                }
            }
        } else {
            lastClockIn = d;
        }
        working = !working;
    }

    return shifts;
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
