import { primitivizeDateOnly, primitivizeKey } from './prim.js';
import { notnull, chday, dateDayDiff, dateTimeUntil, DefaultMap, timePerDay, timePerMinute, timePerHour, formatHms } from './util.js';
export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;
/**
 * @return A 2-uple of the work time per date only, and the warnings per date only.
 */
export function getWorkingHours(key, checks) {
    const warnings = new DefaultMap(() => []);
    const workTimes = new DefaultMap(() => 0);
    const dateKey = primitivizeDateOnly;
    let working = false;
    let lastClockIn = null;
    for (let i = 0; i < checks.length; ++i) {
        const d = checks[i];
        if (working) {
            if (lastClockIn === null)
                throw Error('bug');
            let dayDiff = dateDayDiff(d, lastClockIn);
            if (dayDiff) {
                // make previous work until 23:59
                workTimes.map(dateKey(lastClockIn), v => v + dateTimeUntil(lastClockIn, 23, 59, 0));
                // account for full 24hours of work
                while (dayDiff > 1) {
                    chday(lastClockIn, 1);
                    workTimes.map(dateKey(lastClockIn), v => v + timePerDay - timePerMinute); // work full days 23:59
                    dayDiff--;
                }
                // make next work since midnight
                lastClockIn = new Date(d);
                lastClockIn.setHours(0, 0, 0);
                working = true;
            }
            workTimes.map(dateKey(d), v => d.getTime() - lastClockIn.getTime() + v);
        }
        else {
            // Check for inconsistencies
            if (i + 1 < checks.length) {
                const dnext = checks[i + 1];
                const diff = dnext.getTime() - d.getTime();
                if (diff < minWorkTime) {
                    warn('likely double badged');
                    continue;
                }
                else if (diff > maxWorkTime) {
                    warn('likely forgot to badge');
                    continue;
                }
                function warn(msg) {
                    warnings.get(dateKey(dnext)).push(`employee entered at ${d.toLocaleString()}, worked until ${dnext.toLocaleTimeString()} (for ${formatHms(dnext.getTime() - d.getTime())}): ` + msg);
                }
            }
            lastClockIn = d;
        }
        working = !working;
    }
    return [workTimes, warnings];
}
export function parseWorkerChecks(rows) {
    const workingHours = new DefaultMap(() => []);
    for (const [department, name, no, dateTime, locationId, idNumber, verifyCode, cardNo] of rows) {
        const key = primitivizeKey([department, name, no, ...parseIdNumber(idNumber)]);
        const date = parseDateTime(dateTime);
        workingHours.get(key).push(date);
    }
    return workingHours;
}
function parseDateTime(input) {
    const pattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const [, D, M, Y, h, m, s] = notnull(pattern.exec(input), 'failed to parse date time');
    return new Date(+Y, +M - 1, +D, +h, +m, +s);
}
function parseIdNumber(input) {
    const pattern = /^([A-Z]+)(\d*)$/;
    const [, c, n] = notnull(pattern.exec(input), 'failed to parse id number');
    return [c, n];
}
