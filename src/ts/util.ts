import * as XSLX from "./lib/xlsx.js";

export const timePerDay = 86400_000;
export const timePerHour = 3600_000;
export const timePerMinute = 60_000;
export const timePerSecond = 1_000;

export const siteBaseUrl = '/payroll';

export async function loadHtml(path: string) {
    return new DOMParser().parseFromString(await (await fetch(path)).text(), 'text/html').documentElement
}

export function requireElementById(id: string) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new Error(`Missing element ID ${id}`);
    }
    return el;
}

export function notnull<T>(arg: T | null, msg: string) {
    if (arg === null) {
        throw new Error(msg);
    }
    return arg;
}

export function acce<K extends keyof HTMLElementTagNameMap>(parent: HTMLElement, childTagName: K) {
    return parent.appendChild(document.createElement(childTagName));
}

export function insertHeaderCell(row: HTMLTableRowElement) {
    return acce(row, 'th');
}

export function chday(date: Date, delta: number) {
    date.setDate(date.getDate() + delta);
}

export function formatHms(time: number) {
    const h = time / timePerHour, m = time % timePerHour / timePerMinute, s = time % timePerMinute / timePerSecond,
        f = (n: number) => Math.trunc(n).toString().padStart(2, '0');
    return `${f(h)}:${f(m)}:${f(s)}`;
}

export function dateOnly(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function hourOfTheDay(date: Date) {
    return timePerHour * date.getHours()
        + timePerMinute * date.getMinutes()
        + timePerSecond * date.getSeconds();
}

export function parseCsv(str: string) {
    const arr: string[][] = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        const cc = str[c], nc = str[c + 1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (!quote && cc == ',') { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (!quote && cc == '\r' && nc == '\n') { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (!quote && (cc == '\n' || cc == '\r')) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    arr.shift(); // Remove header row
    return arr;
}

export async function parseExcel(file: Blob): Promise<string[][]> {
    const workbook = XSLX.read(await file.arrayBuffer(), { dense: true });
    const data: (XSLX.CellObject | string)[][] | undefined = workbook.Sheets[workbook.SheetNames[0]]['!data'];
    if (data === undefined) {
        throw new TypeError('workbook missing sheet');
    }
    data.shift(); // skip header
    // modifying the array in place is probably more efficient than a map
    for (const r of data) {
        for (let j = 0; j < r.length; ++j) {
            if (r[j] !== undefined) {
                r[j] = (r[j] as XSLX.CellObject).w ?? '';
            }
        }
    }
    return data as string[][];
}