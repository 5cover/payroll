import { DefaultObjectMap } from './Map.js';
import { notnull, timePerMinute, timePerHour, formatHms } from './util.js';
export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;
;
export class Shift {
    #workTime;
    warnings;
    workTimeChanged = [];
    constructor(workTime, warnings) {
        this.#workTime = workTime;
        this.warnings = warnings;
    }
    get workTime() {
        return this.#workTime;
    }
    set workTime(value) {
        const old = this.#workTime;
        this.#workTime = value;
        this.workTimeChanged.forEach(f => f.call(this, old));
    }
}
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
