import { requireElementById, insertHeaderCell } from './util.mjs';
import { parseWorkerChecks, getWorkingHours, unprimitivize_key } from './domain.mjs';

const inputFile = /** @type { HTMLInputElement } */ (requireElementById('input-file'));
const tableResults = /** @type { HTMLTableElement } */ (requireElementById('table-results'));
const pInputError = requireElementById('p-input-error');

inputFile.addEventListener('change', async function () {
    const file = this.files?.item(0);
    if (!file) return;

    let workerChecks;
    try {
        workerChecks = parseWorkerChecks(await file.text());
    } catch (e) {
        pInputError.textContent = 'Failed to import the working hours sheet. You can try exporting it to CSV and importing that instead. ' + e;
        return;
    }

    for (const [pkey, checks] of workerChecks.entries()) {
        const key = unprimitivize_key(pkey);
        let i = 0;
        const whs = getWorkingHours(key, checks);

        for (const wh of whs) {
            addResultRow(whs.size, i++, key, ...wh);
        }
    }
});

/**
 * 
 * @param {number} size
 * @param {number} i 
 * @param {import('./domain.mjs').Key} key 
 * @param {string} date 
 * @param {number} workedFor 
 */
function addResultRow(size, i, key, date, workedFor) {
    const keyHeaders = ['Department', 'Name', 'No.', 'ID Number'];
    const row = tableResults.insertRow();
    if (i < keyHeaders.length) {
        insertHeaderCell(row).textContent = keyHeaders[i];
        const kc = row.insertCell();
        if (i == 3) {
            kc.textContent = key[i];
            row.insertCell().textContent = key[i + 1];
        } else {
            kc.colSpan = 2;
            kc.textContent = key[i];
        }
    } else if (i == keyHeaders.length) {
        const padc = row.insertCell();
        padc.colSpan = 3;
        padc.rowSpan = size - keyHeaders.length;
    }
    row.insertCell().textContent = date;
    row.insertCell().textContent = workedFor.toString();
}

function clearResult() {
    for (const row of tableResults.rows) {
        row.remove();
    }
}