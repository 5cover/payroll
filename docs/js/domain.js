import { DefaultObjectMap, ObjectMap } from './Map.js';
import { notnull, timePerMinute, timePerHour, formatHms, dateOnly, hourOfTheDay, chday, timePerDay } from './util.js';
export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;
;
export function getWarningMessage(w) {
    return `employee entered at ${formatHms(w.hourStart)}, worked until ${formatHms(w.hourEnd)} (for ${formatHms(w.hourEnd - w.hourStart)}): likely forgot to badge exit`;
}
export function parseWorkerChecks(rows) {
    const workingHours = new DefaultObjectMap(() => [], JSON.stringify, JSON.parse);
    for (const [department, name, no, dateTime, , idNumber, ,] of rows) {
        workingHours
            .get({ department: department, name: name, no: no, idNumber: parseIdNumber(idNumber) })
            .push(parseDateTime(dateTime));
    }
    return workingHours;
}
export function getResults(workerChecks) {
    const result = new ObjectMap(JSON.stringify, JSON.parse);
    for (const [emp, checks] of workerChecks.entries()) {
        result.set(emp, getShifts(checks));
    }
    return result;
}
function getShifts(checks) {
    function dateOnlyKtop(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }
    const shifts = new DefaultObjectMap(() => ({ workTime: 0, warnings: [] }), dateOnlyKtop, dateOnlyPtok);
    let working = false;
    let lastClockIn = null;
    for (const d of checks) {
        if (working) {
            const bd = bin_by_day(lastClockIn, d);
            for (const [day, [hourStart, hourEnd]] of bd) {
                const workTime = hourEnd - hourStart;
                if (workTime <= minWorkTime) {
                    continue;
                }
                if (workTime <= maxWorkTime) {
                    shifts.get(day).workTime += workTime;
                }
                else {
                    shifts.get(day).workTime += maxWorkTime;
                    shifts.get(day).warnings.push({ hourStart, hourEnd });
                }
            }
        }
        else {
            lastClockIn = d;
        }
        working = !working;
    }
    return shifts;
}
function bin_by_day(start, end) {
    const days = new ObjectMap(k => k.getTime(), p => new Date(p));
    const start_early = dateOnly(start);
    const end_early = dateOnly(end);
    if (start_early.getTime() === end_early.getTime()) {
        days.set(start_early, [hourOfTheDay(start), hourOfTheDay(end)]);
        return days;
    }
    const start_late = dateOnly(start);
    chday(start_late, 1);
    if (start !== start_late) {
        days.set(start_early, [hourOfTheDay(start), timePerDay - timePerMinute]);
    }
    for (let d = start_late; d < end_early; chday(d, 1)) {
        days.set(d, [0, timePerDay - timePerMinute]);
    }
    if (end !== end_early) {
        days.set(end_early, [0, hourOfTheDay(end)]);
    }
    return days;
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
