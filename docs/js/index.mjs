import { requireElementById, insertHeaderCell, formatHms } from './util.mjs';
import { parseWorkerChecks, getWorkingHours, unprimitivize_key } from './domain.mjs';

const inputFile = /** @type { HTMLInputElement } */ (requireElementById('input-file'));
const tableResults = /** @type { HTMLTableElement } */ (requireElementById('table-results'));
const pInputError = requireElementById('p-input-error');
const buttonClear = /** @type { HTMLButtonElement } */ (requireElementById('button-clear'));

const keyHeaders = ['Department', 'Name', 'No.', 'ID Number'];

buttonClear.addEventListener('click', () => {
    tableResults.textContent = '';
    buttonClear.disabled = true;
});

inputFile.addEventListener('change', async function () {
    for (const file of this.files || []) {
        try {
            addResult(parseWorkerChecks(await file.text()));
        } catch (e) {
            pInputError.textContent = 'Failed to import the working hours sheet. You can try exporting it to CSV and importing that instead. ' + e;
            return;
        }
    }
});

/**
 * @param {Map<string, Date[]>} workerChecks
 */
function addResult(workerChecks) {
    buttonClear.disabled = false;
    for (const [pkey, checks] of workerChecks.entries()) {
        const key = unprimitivize_key(pkey);
        let i = 0;
        const whs = getWorkingHours(key, checks);

        for (const wh of whs) {
            addResultRow(whs.size, i++, key, ...wh);
        }

        for (; i < keyHeaders.length; ++i) {
            const hr = tableResults.insertRow();
            fillHeaderRow(hr, i, key);
            const padc = hr.insertCell();
            padc.colSpan = 6 - hr.cells.length;
        }
    }
}

/**
 * 
 * @param {number} size
 * @param {number} i 
 * @param {import('./domain.mjs').Key} key 
 * @param {string} date 
 * @param {number} workedFor 
 */
function addResultRow(size, i, key, date, workedFor) {
    const row = tableResults.insertRow();
    if (i < keyHeaders.length) {
        fillHeaderRow(row, i, key);
    } else if (i == keyHeaders.length) {
        const padc = row.insertCell();
        padc.colSpan = 3;
        padc.rowSpan = size - keyHeaders.length;
    }
    row.insertCell().textContent = date;
    row.insertCell().textContent = formatHms(workedFor);
}

/**
 * @param {HTMLTableRowElement} row
 * @param {number} i
 * @param {import('./domain.mjs').Key} key
 */
function fillHeaderRow(row, i, key) {
    insertHeaderCell(row).textContent = keyHeaders[i];
    const kc = row.insertCell();
    if (i == 3) {
        kc.textContent = key[i];
        row.insertCell().textContent = key[i + 1];
    } else {
        kc.colSpan = 2;
        kc.textContent = key[i];
    }
}
