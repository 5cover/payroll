import { getWorkTime } from "../domain.js";
import { deprimitivizeDateOnly, deprimitivizeKey } from "../prim.js";
import { formatHms, insertHeaderCell } from "../util.js";
const resultKeyHeaders = ['Department', 'Name', 'No.', 'ID Number'];
const resultIdNumberColIndex = 3;
const resultColumnCount = 5;
const resultHeaderColumnCount = 2;
export default class ResultsView {
    #tableResults;
    #tableWarnings;
    constructor(resultTable, warningsTable) {
        this.#tableResults = resultTable;
        this.#tableWarnings = warningsTable;
    }
    clear() {
        this.#tableResults.textContent = '';
        this.#tableWarnings.textContent = '';
    }
    addResult(workerChecks) {
        let iWorker = 0;
        for (const [pkey, checks] of workerChecks.entries()) {
            const key = deprimitivizeKey(pkey);
            const [workTimes, warnings] = getWorkTime(key, checks);
            let iWorkTime = 0;
            for (const [dateKey, workTime] of workTimes) {
                const row = this.#addResultRow(workTimes.size, iWorker, iWorkTime++, key, deprimitivizeDateOnly(dateKey), workTime);
                const warns = warnings.get(dateKey);
                if (warns.length > 0) {
                    this.#markResultRowWarning(row, warns);
                    for (const w of warns) {
                        this.#addWarning(row.id, w);
                    }
                }
            }
            if (iWorkTime < resultKeyHeaders.length) {
                const hr = this.#addKeyPaddingRow(iWorkTime, key);
                const padc = hr.insertCell();
                padc.rowSpan = resultKeyHeaders.length - iWorkTime++;
                padc.colSpan = resultColumnCount - hr.cells.length + 1;
            }
            while (iWorkTime < resultKeyHeaders.length) {
                this.#addKeyPaddingRow(iWorkTime++, key);
            }
            this.#tableResults.insertRow().insertCell().colSpan = resultColumnCount;
            iWorker++;
        }
        this.#addHeaders();
    }
    #rowId(iWorker, iWorkTime) {
        return `${iWorker + 1}.${iWorkTime + 1}`;
    }
    #addKeyPaddingRow(iWorkTime, key) {
        const hr = this.#tableResults.insertRow();
        this.#fillHeaderRow(hr, iWorkTime, key);
        return hr;
    }
    #addHeaders() {
        this.#tableResults.createCaption().textContent = 'Work times';
        if (this.#tableResults.rows.length > 0) {
            const row = this.#tableResults.insertRow(0);
            const thKey = insertHeaderCell(row);
            thKey.colSpan = resultHeaderColumnCount;
            thKey.textContent = 'Key';
            insertHeaderCell(row).textContent = '#';
            insertHeaderCell(row).textContent = 'Date';
            insertHeaderCell(row).textContent = 'Work time';
        }
        if (this.#tableWarnings.rows.length > 0) {
            this.#tableWarnings.createCaption().textContent = 'Warnings';
            const row = this.#tableWarnings.insertRow(0);
            insertHeaderCell(row).textContent = 'Actions';
            insertHeaderCell(row).textContent = 'Location';
            insertHeaderCell(row).textContent = 'Message';
        }
    }
    #addResultRow(size, iWorker, iWorkTime, key, date, workedFor) {
        const row = this.#tableResults.insertRow();
        if (iWorkTime < resultKeyHeaders.length) {
            this.#fillHeaderRow(row, iWorkTime, key);
        }
        else if (iWorkTime == resultKeyHeaders.length) {
            const padc = row.insertCell();
            padc.colSpan = resultHeaderColumnCount;
            padc.rowSpan = size - resultKeyHeaders.length;
        }
        row.insertCell().textContent = row.id = this.#rowId(iWorker, iWorkTime);
        row.insertCell().textContent = date.toLocaleDateString();
        row.insertCell().textContent = formatHms(workedFor);
        return row;
    }
    #markResultRowWarning(row, warnings) {
        for (let i = row.cells.length - 1; i > row.cells.length - resultColumnCount + resultHeaderColumnCount; --i) {
            const c = row.cells.item(i);
            if (c === null)
                debugger;
            c.className = 'bg-warning';
            c.title = warnings.join('\n');
        }
    }
    #addWarning(rowId, warning) {
        const row = this.#tableWarnings.insertRow();
        row.insertCell().innerHTML = `<button type="button">Allow</button>`;
        row.insertCell().innerHTML = `<a href="#${rowId}">${rowId}</a>`;
        row.insertCell().textContent = warning;
    }
    #fillHeaderRow(row, iWorkTime, key) {
        insertHeaderCell(row).textContent = resultKeyHeaders[iWorkTime];
        const kc = row.insertCell();
        if (iWorkTime == resultIdNumberColIndex) {
            kc.textContent = key[iWorkTime] + key[iWorkTime + 1];
        }
        else {
            kc.textContent = key[iWorkTime];
        }
    }
}
