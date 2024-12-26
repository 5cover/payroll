/**
 * 
 * @param {Date} date 
 */


/**
 * @typedef {import('./domain.mjs').Key} Key 
 */

export function primitivizeDateOnly(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * 
 * @param {string} date 
 */
export function deprimitivizeDateOnly(date) {
    let [y, m, d] = date.split('-', 3);
    return new Date(+y, +m, +d);
}

/**
 * composite key hack
 * @param {Key} key
 */
export function primitivizeKey(key) {
    return JSON.stringify(key);
}

/**
 * @param {string} key 
 * @returns {Key}
 */
export function unprimitivizeKey(key) {
    return JSON.parse(key);
}