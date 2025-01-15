import { DefaultObjectMap } from './Map.js';
import { notnull, timePerMinute, timePerHour, formatHms } from './util.js';

export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;

export interface Employee {
    department: string,
    name: string,
    no: string,
    idNumber: [string, number],
};

export interface Warning {
    hourStart: number;
    hourEnd: number;
}

export class Shift {
    #workTime: number;
    warnings: Warning[];

    workTimeChanged: ((this: this, oldValue: number) => void)[] = [];

    constructor(workTime: number, warnings: Warning[]) {
        this.#workTime = workTime;
        this.warnings = warnings;
    }

    get workTime() {
        return this.#workTime;
    }

    set workTime(value: number) {
        const old = this.#workTime;
        this.#workTime = value;
        this.workTimeChanged.forEach(f => f.call(this, old));
    }
}

export function getWarningMessage(w: Warning) {
    return `employee entered at ${formatHms(w.hourStart)}, worked until ${formatHms(w.hourEnd)} (for ${formatHms(w.hourEnd - w.hourStart)}): likely forgot to badge exit`;
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
