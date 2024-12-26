import { requireElementById, insertHeaderCell, formatHms, parseExcel, parseCsv } from './util.js';
import { parseWorkerChecks, getWorkingHours as getWorkTime, Key } from './domain.js';
import { deprimitivizeDateOnly, deprimitivizeKey } from './prim.js';

const inputFile = requireElementById('input-file') as HTMLInputElement;
const tableResults = requireElementById('table-results') as HTMLTableElement;
const pInputError = requireElementById('p-input-error');
const buttonClear = requireElementById('button-clear') as HTMLButtonElement;

const keyHeaders = ['Department', 'Name', 'No.', 'ID Number'];
const idNumberIndex = 3;
const columnCount = 5;

buttonClear.addEventListener('click', () => {
    tableResults.textContent = '';
    buttonClear.disabled = true;
});

inputFile.addEventListener('change', async function () {
    for (const file of this.files ?? []) {
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

function addResult(workerChecks: Map<string, Date[]>) {
    buttonClear.disabled = false;

    addHeaderRow();

    let iWorker = 0;
    for (const [pkey, checks] of workerChecks.entries()) {
        const key = deprimitivizeKey(pkey);
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

function rowId(iWorker: number, iWorkTime: number) {
    return iWorker + '.' + iWorkTime;
}

function addKeyPaddingRow(iWorkTime: number, key: Key) {
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

function addResultRow(size: number, iWorkTime: number, key: Key, date: Date, workedFor: number, warnings: string[]) {
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

function fillHeaderRow(row: HTMLTableRowElement, iWorkTime: number, key: Key) {
    insertHeaderCell(row).textContent = keyHeaders[iWorkTime];
    const kc = row.insertCell();
    if (iWorkTime == idNumberIndex) {
        kc.textContent = key[iWorkTime] + key[iWorkTime + 1];
    } else {
        kc.textContent = key[iWorkTime];
    }
}
