import { Employee, maxWorkTime, minWorkTime, Shift } from "../domain.js";
import { ObjectMap, DefaultMap, DefaultObjectMap } from "../../Map.js";
import { chday, dateOnly, hourOfTheDay, timePerDay, timePerMinute } from "../../util.js";

export default class Result {
    readonly employeeShifts = new ObjectMap<Employee, DefaultMap<Date, Shift>, string>(JSON.stringify, JSON.parse);

    constructor(workerChecks: Map<Employee, Date[]>) {
        for (const [emp, checks] of workerChecks.entries()) {
            this.employeeShifts.set(emp, getShifts(/* emp,  */checks));
        }
    }
}

function getShifts(/* emp: Employee,  */checks: Date[]) {
    function dateOnlyKtop(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date: string) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }

    const shifts = new DefaultObjectMap<Date, Shift, string>(() => new Shift(0, []), dateOnlyKtop, dateOnlyPtok);

    let working = false;
    let lastClockIn: Date = null!;
    for (const d of checks) {
        if (working) {
            // d is a clockout

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