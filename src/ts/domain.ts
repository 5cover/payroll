import { DefaultMap, DefaultObjectMap, ObjectMap } from './Map.js';
import { notnull, timePerMinute, timePerHour, formatHms, dateOnly, hourOfTheDay, chday, timePerDay } from './util.js';

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

export interface Shift {
    workTime: number;
    warnings: Warning[];
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

    const shifts = new DefaultObjectMap<Date, Shift, string>(() => ({ workTime: 0, warnings: [] }), dateOnlyKtop, dateOnlyPtok);

    let working = false;
    let lastClockIn: Date = null!;
    for (const d of checks) {
        //for (let i = 0; i < checks.length; ++i) {
        //const d = checks[i];
        if (working) {
            // d is a clockout
            // what if workTIme > 1 day?

            const bd = bin_by_day(lastClockIn, d);
            for (const [day, [hourStart, hourEnd]] of bd) {
                const workTime = hourEnd - hourStart;
                if (workTime <= minWorkTime) {
                    continue;
                }
                if (workTime <= maxWorkTime) {
                    shifts.get(day).workTime += workTime;
                } else {
                    shifts.get(day).workTime += maxWorkTime;
                    shifts.get(day).warnings.push({ hourStart, hourEnd });
                }
            }

        } else {
            lastClockIn = d;
        }
        working = !working;
    }

    return shifts;
}

function bin_by_day(start: Date, end: Date) {
    const days = new ObjectMap<Date, [number, number], number>(k => k.getTime(), p => new Date(p));

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
        days.set(d, [0, timePerDay - timePerMinute]); // 23:59
    }
    if (end !== end_early) {
        days.set(end_early, [0, hourOfTheDay(end)]);
    }

    return days;
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
