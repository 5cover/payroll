import { notnull, parseCsv, chday, dateDayDiff, dateTimeUntil, DefaultMap, timePerDay, timePerMinute } from './util.mjs';


/**
 * @typedef {[string, string, string, string, string]} Key 
 */

/**
 * 
 * @param {Key} key 
 * @param {Date[]} checks 
 */
export function getWorkingHours(key, checks) {
    let working = false;
    let lastClockIn = null;

    /**
     * @type {DefaultMap<string, number>}
     */
    const workedFor = new DefaultMap(() => 0);
    for (const d of checks) {
        if (working) {
            if (lastClockIn === null) throw Error('bug');

            let dayDiff = dateDayDiff(d, lastClockIn);
            if (dayDiff) {
                // make previous work until 23:59
                workedFor.map(lastClockIn.toLocaleDateString(), v => v + dateTimeUntil(lastClockIn, 23, 59, 0));

                // account for full 24hours of work
                while (dayDiff > 1) {
                    chday(lastClockIn, 1);
                    workedFor.map(lastClockIn.toLocaleDateString(), v => v + timePerDay - timePerMinute); // work full days 23:59
                    dayDiff--;
                }

                // make next work since midnight
                lastClockIn = new Date(d);
                lastClockIn.setHours(0, 0, 0);
                working = true;
            }
            workedFor.map(d.toLocaleDateString(), v => d.getTime() - lastClockIn.getTime() + v);
        } else {
            lastClockIn = d;
        }
        working = !working;
    }

    return workedFor;
}

/**
 * @param {any[]} rows
 */
export function parseWorkerChecks(rows) {
    rows.shift(); // Remove header row
    /** @type {DefaultMap<string, Date[]>} */
    const working_hours = new DefaultMap(() => []);
    for (const [department, name, no, dateTime, locationId, idNumber, verifyCode, cardNo] of rows) {
        const key = primitivize_key([department, name, no, ...parseIdNumber(idNumber)]);
        const date = parseDateTime(dateTime);
        working_hours.get(key).push(date);
    }
    return working_hours;
}

/**
 * composite key hack
 * @param {Key} key
 */
export function primitivize_key(key) {
    return JSON.stringify(key);
}

/**
 * @param {string} key 
 * @returns {Key}
 */
export function unprimitivize_key(key) {
    return JSON.parse(key);
}

/**
 * @param {string} input
 */
function parseDateTime(input) {
    const pattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const [, D, M, Y, h, m, s] = notnull(pattern.exec(input));
    return new Date(+Y, +M - 1, +D, +h, +m, +s);
}

/**
 * @param {string} input
 * @return {[string, string]}
 */
function parseIdNumber(input) {
    const pattern = /^([A-Z]+)(\d*)$/;
    const [, c, n] = notnull(pattern.exec(input));
    return [c, n];
}

/**
 * @param {Date} date 
 */
function ceilDate(date) {
    const d = new Date(date);
    if (date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0) {
        chday(d, 1);
        d.setHours(0, 0, 0);
    }
    return d;
}

/**
 * @param {Date} date
 */
function floorDate(date) {
    const d = new Date(date);
    if (date.getHours() != 23 || date.getMinutes() != 59) {
        d.setHours(0, 0, 0);
    }
    return d;
}
