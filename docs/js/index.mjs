import { requireElementById, insertHeaderCell, formatHms, parseExcel, parseCsv } from './util.mjs';
import { parseWorkerChecks, getWorkingHours as getWorkTime } from './domain.mjs';
import { deprimitivizeDateOnly, primitivizeKey, unprimitivizeKey } from './prim.mjs';

/**
 * @typedef {import('./domain.mjs').Key} Key 
 */

const inputFile = /** @type { HTMLInputElement } */ (requireElementById('input-file'));
const tableResults = /** @type { HTMLTableElement } */ (requireElementById('table-results'));
const pInputError = requireElementById('p-input-error');
const buttonClear = /** @type { HTMLButtonElement } */ (requireElementById('button-clear'));

const keyHeaders = ['Department', 'Name', 'No.', 'ID Number'];
const idNumberIndex = 3;
const columnCount = 5;

buttonClear.addEventListener('click', () => {
    tableResults.textContent = '';
    buttonClear.disabled = true;
});

inputFile.addEventListener('change', async function () {
    for (const file of this.files || []) {
        try {
            const result = file.type === 'text/csv'
                ? parseCsv(await file.text())
                : await parseExcel(file);
            addResult(parseWorkerChecks(result));
        } catch (e) {
            pInputError.textContent = 'Failed to import the badges sheet. You can try exporting it to CSV and importing that instead. ' + e;
            return;
        }
    }
});

/**
 * @param {Map<string, Date[]>} workerChecks
 */
function addResult(workerChecks) {
    buttonClear.disabled = false;

    addHeaderRow();

    let iWorker = 0;
    for (const [pkey, checks] of workerChecks.entries()) {
        const key = unprimitivizeKey(pkey);
        const [workTimes, warnings] = getWorkTime(key, checks);

        let iWorkTime = 0;
        for (const [dateKey, workTime] of workTimes) {
            addResultRow(workTimes.size, iWorkTime++, key, deprimitivizeDateOnly(dateKey), workTime, warnings.get(dateKey))
                .id = rowId(iWorker, iWorkTime);
        }

        if (iWorkTime < keyHeaders.length) {
            const hr = addKeyPaddingRow(iWorkTime, key);
            const padc = hr.insertCell();
            padc.rowSpan = keyHeaders.length - iWorkTime++;
            padc.colSpan = columnCount - hr.cells.length + 1;
        }
        while (iWorkTime < keyHeaders.length) {
            addKeyPaddingRow(iWorkTime++, key);
        }

        // margin row
        tableResults.insertRow().insertCell().colSpan = columnCount;

        iWorker++;
    }
}

/**
 * @param {Number} iWorker
 * @param {Number} iWorkTime
 */
function rowId(iWorker, iWorkTime) {
    return iWorker + '.' + iWorkTime;
}

/**
 * 
 * @param {number} iWorkTime 
 * @param {Key} key 
 */
function addKeyPaddingRow(iWorkTime, key) {
    const hr = tableResults.insertRow();
    fillHeaderRow(hr, iWorkTime, key);
    return hr;
}

function addHeaderRow() {
    const row = tableResults.insertRow();
    const thKey = insertHeaderCell(row);
    thKey.colSpan = 2;
    thKey.textContent = 'Key';
    const thDate = insertHeaderCell(row);
    thDate.textContent = 'Date';
    const thWorkTime = insertHeaderCell(row);
    thWorkTime.textContent = 'Work time';
    const thWarnings = insertHeaderCell(row);
    thWarnings.textContent = 'Warnings';
}

/**
 * 
 * @param {number} size
 * @param {number} iWorkTime 
 * @param {Key} key 
 * @param {Date} date 
 * @param {number} workedFor 
 * @param {string[]} warnings
 */
function addResultRow(size, iWorkTime, key, date, workedFor, warnings) {
    const row = tableResults.insertRow();
    if (iWorkTime < keyHeaders.length) {
        fillHeaderRow(row, iWorkTime, key);
    } else if (iWorkTime == keyHeaders.length) {
        const padc = row.insertCell();
        padc.colSpan = columnCount - 3;
        padc.rowSpan = size - keyHeaders.length;
    }
    row.insertCell().textContent = date.toLocaleDateString();
    row.insertCell().textContent = formatHms(workedFor);
    row.insertCell().innerHTML = '<p>' + warnings.join('</p><p>') + '</p>';
    return row;
}

/**
 * @param {HTMLTableRowElement} row
 * @param {number} iWorkTime
 * @param {Key} key
 */
function fillHeaderRow(row, iWorkTime, key) {
    insertHeaderCell(row).textContent = keyHeaders[iWorkTime];
    const kc = row.insertCell();
    if (iWorkTime == idNumberIndex) {
        kc.textContent = key[iWorkTime] + key[iWorkTime + 1];
    } else {
        kc.textContent = key[iWorkTime];
    }
}
