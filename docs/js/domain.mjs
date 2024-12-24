import { notnull, parseCsv, chday, DefaultMap } from './util.mjs';

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
    let last_clock_in = null;
    /** @type {DefaultMap<string, number>} */
    const workedFor = new DefaultMap(() => 0);
    for (const d of checks) {
        if (!working) {
            last_clock_in = d;
        } else {
            binTime(workedFor, notnull(last_clock_in), d);
        }
        working = !working;
    }

    return workedFor;
}

/**
 * 
 * @param {DefaultMap<string, number>} workedFor 
 * @param {Date} min
 * @param {Date} max
 */
function binTime(workedFor, min, max) {
    const imin = ceilDate(min);
    const imax = floorDate(max);

    let diff = imin.getTime() - min.getTime();
    if (diff) {
        workedFor.map(min.toLocaleDateString(), v => v + diff - 60_000);
    }
    for (const i = new Date(imin); i < imax; chday(i, 1)) {
        workedFor.map(i.toLocaleDateString(), v => v + 23 * 3600_000 + 59 * 60_000);
    }
    diff = max.getTime() - imax.getTime();
    if (diff) {
        workedFor.map(imax.toLocaleDateString(), v => v + diff);
    }
}

/*
02/12/2024 21:00:00 -> 04/12/2024 04:00:00

02/12/2024 -> 02:59:00
03/12/2024 -> 23:59:00
04/12/2024 -> 04:00:00
*/
let d1 = new Date(2024, 12, 2, 21, 0, 0);
let d2 = new Date(2024, 12, 4, 4, 0, 0);

/**
 * @param {string} str 
 */
export function parseWorkerChecks(str) {
    const rows = parseCsv(str);
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
