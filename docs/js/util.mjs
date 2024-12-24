/**
 * @param {string} id
 */
export function requireElementById(id) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new Error(`Missing element ID ${id}`);
    }
    return el;
}

/**
 * @template T
 * @param {T|null} arg
 * @return {T}
 */
export function notnull(arg) {
    if (arg === null) {
        throw new Error('was null');
    }
    return arg;
}

/**
 * @param {HTMLTableRowElement} row 
 * @returns {HTMLTableCellElement}
 */
export function insertHeaderCell(row) {
    return row.appendChild(document.createElement('th'));
}

/**
 * @param {string} str
 */
export function parseCsv(str) {
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

/**
 * @param {Date} date
 * @param {number} delta
 */
export function chday(date, delta) {
    date.setDate(date.getDate() + delta);
}

/**
 * @param {number} time 
 */
export function formatHms(time) {
    const h = time / 3600_000, m = time / 60_000 % 60, s = time % 60_000,
        f = (/** @type {number} */ n) => Math.trunc(n).toString().padStart(2, '0');
    return `${f(h)}:${f(m)}:${f(s)}`;
}

/**
 * @template TKey, TValue
 * @extends {Map<TKey, TValue>}
 */
export class DefaultMap extends Map {
    #default;

    /**
     * @param {() => TValue} defaultFactory
     */
    constructor(defaultFactory) {
        super();
        this.#default = defaultFactory;
    }

    /**
     * @param {TKey} key
    */
    get(key) {
        const value = super.get(key);
        if (value !== undefined) {
            return value;
        }
        const def = this.#default();
        this.set(key, def);
        return def;
    }

    /**
     * @param {TKey} key
     * @param {(value: TValue) => TValue} f
     */
    map(key, f) {
        this.set(key, f(this.get(key)));
    }
}