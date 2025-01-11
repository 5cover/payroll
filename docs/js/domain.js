import { DefaultObjectMap, ObjectMap } from './Map.js';
import { notnull, chday, dateDayDiff, dateTimeUntil, timePerDay, timePerMinute, timePerHour, formatHms } from './util.js';
export const minWorkTime = 10 * timePerMinute;
export const maxWorkTime = 10 * timePerHour;
;
export var WarningKind;
(function (WarningKind) {
    WarningKind[WarningKind["ForgotToBadge"] = 0] = "ForgotToBadge";
})(WarningKind || (WarningKind = {}));
export function getWarningMessage(w) {
    switch (w.kind) {
        case WarningKind.ForgotToBadge:
            return `employee entered at ${w.dateStart.toLocaleString()}, worked until ${w.dateEnd.toLocaleString()} (for ${formatHms(w.dateEnd.getTime() - w.dateStart.getTime())}): likely forgot to badge exit`;
    }
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
        result.set(emp, getWorkTime(checks));
    }
    return result;
}
function getWorkTime(checks) {
    function dateOnlyKtop(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    function dateOnlyPtok(date) {
        const [y, m, d] = date.split('-', 3);
        return new Date(+y, +m, +d);
    }
    const workTimes = new DefaultObjectMap(() => ({ workedFor: 0 }), dateOnlyKtop, dateOnlyPtok);
    let working = false;
    let lastClockIn = null;
    for (let i = 0; i < checks.length; ++i) {
        const d = checks[i];
        if (working) {
            const workTime = d.getTime() - lastClockIn.getTime();
            if (workTime >= minWorkTime) {
                if (workTime <= maxWorkTime) {
                    let dayDiff = dateDayDiff(d, lastClockIn);
                    if (dayDiff) {
                        workTimes.get(lastClockIn).workedFor += dateTimeUntil(lastClockIn, 23, 59, 0);
                        while (dayDiff-- > 1) {
                            chday(lastClockIn, 1);
                            workTimes.get(lastClockIn).workedFor += timePerDay - timePerMinute;
                        }
                        lastClockIn = new Date(d);
                        lastClockIn.setHours(0, 0, 0);
                    }
                    workTimes.get(d).workedFor += d.getTime() - lastClockIn.getTime();
                }
                else {
                    const wt = workTimes.get(d);
                    wt.workedFor += maxWorkTime;
                    wt.warning = {
                        kind: WarningKind.ForgotToBadge,
                        dateStart: checks[i - 1],
                        dateEnd: d,
                    };
                }
            }
        }
        else {
            lastClockIn = d;
        }
        working = !working;
    }
    return workTimes;
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
