import * as XSLX from "./lib/xlsx.js";
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
export function acce(parent, childTagName) {
    return parent.appendChild(document.createElement(childTagName));
}
export function insertHeaderCell(row) {
    return acce(row, 'th');
}
export function chday(date, delta) {
    date.setDate(date.getDate() + delta);
}
export function formatHms(time) {
    const h = time / timePerHour, m = time % timePerHour / timePerMinute, s = time % timePerMinute / timePerSecond, f = (n) => Math.trunc(n).toString().padStart(2, '0');
    return `${f(h)}:${f(m)}:${f(s)}`;
}
export function dateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
export function hourOfTheDay(date) {
    return timePerHour * date.getHours()
        + timePerMinute * date.getMinutes()
        + timePerSecond * date.getSeconds();
}
export function parseCsv(str) {
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        const cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';
        if (cc == '"' && quote && nc == '"') {
            arr[row][col] += cc;
            ++c;
            continue;
        }
        if (cc == '"') {
            quote = !quote;
            continue;
        }
        if (!quote && cc == ',') {
            ++col;
            continue;
        }
        if (!quote && cc == '\r' && nc == '\n') {
            ++row;
            col = 0;
            ++c;
            continue;
        }
        if (!quote && (cc == '\n' || cc == '\r')) {
            ++row;
            col = 0;
            continue;
        }
        arr[row][col] += cc;
    }
    arr.shift();
    return arr;
}
export async function parseExcel(file) {
    const workbook = XSLX.read(await file.arrayBuffer(), { dense: true });
    const data = workbook.Sheets[workbook.SheetNames[0]]['!data'];
    if (data === undefined) {
        throw new TypeError('workbook missing sheet');
    }
    data.shift();
    for (const r of data) {
        for (let j = 0; j < r.length; ++j) {
            if (r[j] !== undefined) {
                r[j] = r[j].w ?? '';
            }
        }
    }
    return data;
}
