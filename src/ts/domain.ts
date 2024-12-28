import { DefaultMap, DefaultObjectMap } from './Map.js';
import { notnull, chday, dateDayDiff, dateTimeUntil, timePerDay, timePerMinute, timePerHour, formatHms } from './util.js';

export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;

export interface Employee {
    department: string,
    name: string,
    no: string,
    idNumber: [string, number],
};

export function parseWorkerChecks(rows: string[][]) {
    const workingHours = new DefaultObjectMap<Employee, Date[], string>(() => [], JSON.stringify, JSON.parse);
    for (const [department, name, no, dateTime, /* locationId */, idNumber, /* verifyCode */, /* cardNo */] of rows) {
        workingHours
            .get({ department: department, name: name, no: no, idNumber: parseIdNumber(idNumber) })
            .push(parseDateTime(dateTime));
    }
    return workingHours;
}

/**
 * @return A 2-uple of the work time per date only, and the warnings per date only.
 */
export function getWorkTime(emp: Employee, checks: Date[]): [DefaultMap<Date, number>, DefaultMap<Date, string[]>] {
    function dateOnlyKtop(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date: string) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }

    const warnings = new DefaultObjectMap<Date, string[], string>(() => [], dateOnlyKtop, dateOnlyPtok);
    const workTimes = new DefaultObjectMap<Date, number, string>(() => 0, dateOnlyKtop, dateOnlyPtok);

    let working = false;
    let lastClockIn: Date = null!;
    for (let i = 0; i < checks.length; ++i) {
        const d = checks[i];

        if (working) {
            let dayDiff = dateDayDiff(d, lastClockIn);
            if (dayDiff) {
                // make previous work until 23:59
                workTimes.map(lastClockIn, v => v + dateTimeUntil(lastClockIn, 23, 59, 0));

                // account for full 24hours of work
                while (dayDiff > 1) {
                    chday(lastClockIn, 1);
                    workTimes.map(lastClockIn, v => v + timePerDay - timePerMinute); // work full days 23:59
                    dayDiff--;
                }

                // make next work since midnight
                lastClockIn = new Date(d);
                lastClockIn.setHours(0, 0, 0);
                working = true;
            }
            workTimes.map(d, v => d.getTime() - lastClockIn.getTime() + v);
        } else {
            // Check for inconsistencies
            if (i + 1 < checks.length) {
                const dnext = checks[i + 1];
                const diff = dnext.getTime() - d.getTime();

                if (diff < minWorkTime) {
                    //warn('likely double badged'); // disabled as it is insignificant
                    continue;
                }
                else if (diff > maxWorkTime) {
                    warn('likely forgot to badge');
                    continue;
                }

                function warn(msg: string) {
                    warnings.get(dnext).push(`employee entered at ${d.toLocaleString()}, worked until ${dnext.toLocaleTimeString()} (for ${formatHms(dnext.getTime() - d.getTime())}): ` + msg);
                }
            }

            lastClockIn = d;
        }
        working = !working;
    }

    return [workTimes, warnings];
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
