import { DefaultObjectMap } from './Map.js';
import { notnull, chday, dateDayDiff, dateTimeUntil, timePerDay, timePerMinute, timePerHour, formatHms } from './util.js';
export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;
;
export function parseWorkerChecks(rows) {
    const workingHours = new DefaultObjectMap(() => [], JSON.stringify, JSON.parse);
    for (const [department, name, no, dateTime, , idNumber, ,] of rows) {
        workingHours
            .get({ department: department, name: name, no: no, idNumber: parseIdNumber(idNumber) })
            .push(parseDateTime(dateTime));
    }
    return workingHours;
}
export function getWorkTime(emp, checks) {
    function dateOnlyKtop(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }
    const warnings = new DefaultObjectMap(() => [], dateOnlyKtop, dateOnlyPtok);
    const workTimes = new DefaultObjectMap(() => 0, dateOnlyKtop, dateOnlyPtok);
    let working = false;
    let lastClockIn = null;
    for (let i = 0; i < checks.length; ++i) {
        const d = checks[i];
        if (working) {
            let dayDiff = dateDayDiff(d, lastClockIn);
            if (dayDiff) {
                workTimes.map(lastClockIn, v => v + dateTimeUntil(lastClockIn, 23, 59, 0));
                while (dayDiff > 1) {
                    chday(lastClockIn, 1);
                    workTimes.map(lastClockIn, v => v + timePerDay - timePerMinute);
                    dayDiff--;
                }
                lastClockIn = new Date(d);
                lastClockIn.setHours(0, 0, 0);
                working = true;
            }
            workTimes.map(d, v => d.getTime() - lastClockIn.getTime() + v);
        }
        else {
            if (i + 1 < checks.length) {
                const dnext = checks[i + 1];
                const diff = dnext.getTime() - d.getTime();
                if (diff < minWorkTime) {
                    continue;
                }
                else if (diff > maxWorkTime) {
                    warn('likely forgot to badge');
                    continue;
                }
                function warn(msg) {
                    warnings.get(dnext).push(`employee entered at ${d.toLocaleString()}, worked until ${dnext.toLocaleTimeString()} (for ${formatHms(dnext.getTime() - d.getTime())}): ` + msg);
                }
            }
            lastClockIn = d;
        }
        working = !working;
    }
    return [workTimes, warnings];
}
function parseDateTime(input) {
    const pattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const [, D, M, Y, h, m, s] = notnull(pattern.exec(input), 'failed to parse date time');
    return new Date(+Y, +M - 1, +D, +h, +m, +s);
}
function parseIdNumber(input) {
    const pattern = /^([A-Z]+)(\d*)$/;
    const [, c, n] = notnull(pattern.exec(input), 'failed to parse id number');
    return [c, +n];
}
