import { notnull, parseCsv, DefaultMap } from './util.mjs';

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
            const date = d.toDateString();
            // todo
            workedFor.set(date, workedFor.get(date) + 1);
            notnull(last_clock_in);
        }
        working = !working;
    }

    return workedFor;
}

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