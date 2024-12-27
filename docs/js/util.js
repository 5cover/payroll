export const timePerDay = 86400_000;
export const timePerHour = 3600_000;
export const timePerMinute = 60_000;
export const timePerSecond = 1_000;
export function requireElementById(id) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new Error(`Missing element ID ${id}`);
    }
    return el;
}
export function notnull(arg, msg) {
    if (arg === null) {
        throw new Error(msg);
    }
    return arg;
}
export function insertHeaderCell(row) {
    return row.appendChild(document.createElement('th'));
}
export function chday(date, delta) {
    date.setDate(date.getDate() + delta);
}
export function formatHms(time) {
    const h = time / timePerHour, m = time % timePerHour / timePerMinute, s = time % timePerMinute / timePerSecond, f = (n) => Math.trunc(n).toString().padStart(2, '0');
    return `${f(h)}:${f(m)}:${f(s)}`;
}
export function dateDayDiff(d1, d2) {
    return (new Date(d1).setHours(0, 0, 0) - new Date(d2).setHours(0, 0, 0)) / timePerDay;
}
export function dateTimeUntil(date, h, m, s) {
    return timePerHour * (h - date.getHours())
        + timePerMinute * (m - date.getMinutes())
        + timePerSecond * (s - date.getSeconds());
}
export function dateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
export class DefaultMap extends Map {
    #default;
    constructor(defaultFactory) {
        super();
        this.#default = defaultFactory;
    }
    get(key) {
        const value = super.get(key);
        if (value !== undefined) {
            return value;
        }
        const def = this.#default();
        this.set(key, def);
        return def;
    }
    map(key, f) {
        this.set(key, f(this.get(key)));
    }
}
export function parseCsv(str) {
    const arr = [];
    let quote = false; // 'true' means we're inside a quoted field
    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        const cc = str[c], nc = str[c + 1]; // Current character, next character
        arr[row] = arr[row] || []; // Create a new row if necessary
        arr[row][col] = arr[row][col] || ''; // Create a new column (start with empty string) if necessary
        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') {
            arr[row][col] += cc;
            ++c;
            continue;
        }
        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') {
            quote = !quote;
            continue;
        }
        // If it's a comma and we're not in a quoted field, move on to the next column
        if (!quote && cc == ',') {
            ++col;
            continue;
        }
        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (!quote && cc == '\r' && nc == '\n') {
            ++row;
            col = 0;
            ++c;
            continue;
        }
        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (!quote && (cc == '\n' || cc == '\r')) {
            ++row;
            col = 0;
            continue;
        }
        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    arr.shift(); // Remove header row
    return arr;
}
export async function parseExcel(file) {
    const workbook = XSLX.read(await file.arrayBuffer(), { dense: true });
    const data = workbook.Sheets[workbook.SheetNames[0]]['!data'];
    if (data === undefined) {
        throw new TypeError('workbook missing sheet');
    }
    data.shift(); // skip header
    // modifying the array in place is probably more efficient than a map
    for (const r of data) {
        for (let j = 0; j < r.length; ++j) {
            if (r[j] !== undefined) {
                r[j] = r[j].w ?? '';
            }
        }
    }
    return data;
}
