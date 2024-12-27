import { getWorkTime, Key } from "../domain.js";
import { deprimitivizeDateOnly, deprimitivizeKey } from "../prim.js";
import { formatHms, insertHeaderCell } from "../util.js";

const resultKeyHeaders = ['Department', 'Name', 'No.', 'ID Number'];
const resultIdNumberColIndex = 3;
const resultColumnCount = 5;

export default class ResultTable {
    #table: HTMLTableElement;
    constructor(table: HTMLTableElement) {
        this.#table = table;
    }

    clear() {
        this.#table.textContent = '';
    }

    addResult(workerChecks: Map<string, Date[]>) {
        this.#addHeaderRow();

        let iWorker = 0;
        for (const [pkey, checks] of workerChecks.entries()) {
            const key = deprimitivizeKey(pkey);
            const [workTimes, warnings] = getWorkTime(key, checks);

            let iWorkTime = 0;
            for (const [dateKey, workTime] of workTimes) {
                this.#addResultRow(workTimes.size, iWorkTime++, key, deprimitivizeDateOnly(dateKey), workTime, warnings.get(dateKey))
                    .id = this.rowId(iWorker, iWorkTime);
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

            // margin row
            this.#table.insertRow().insertCell().colSpan = resultColumnCount;

            iWorker++;
        }
    }

    rowId(iWorker: number, iWorkTime: number) {
        return `${iWorker}.${iWorkTime}`;
    }

    #addKeyPaddingRow(iWorkTime: number, key: Key) {
        const hr = this.#table.insertRow();
        this.#fillHeaderRow(hr, iWorkTime, key);
        return hr;
    }

    #addHeaderRow() {
        const row = this.#table.insertRow();
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

    #addResultRow(size: number, iWorkTime: number, key: Key, date: Date, workedFor: number, warnings: string[]) {
        const row = this.#table.insertRow();
        if (iWorkTime < resultKeyHeaders.length) {
            this.#fillHeaderRow(row, iWorkTime, key);
        } else if (iWorkTime == resultKeyHeaders.length) {
            const padc = row.insertCell();
            padc.colSpan = resultColumnCount - 3;
            padc.rowSpan = size - resultKeyHeaders.length;
        }
        row.insertCell().textContent = date.toLocaleDateString();
        row.insertCell().textContent = formatHms(workedFor);
        row.insertCell().innerHTML = '<p>' + warnings.join('</p><p>') + '</p>';
        return row;
    }

    #fillHeaderRow(row: HTMLTableRowElement, iWorkTime: number, key: Key) {
        insertHeaderCell(row).textContent = resultKeyHeaders[iWorkTime];
        const kc = row.insertCell();
        if (iWorkTime == resultIdNumberColIndex) {
            kc.textContent = key[iWorkTime] + key[iWorkTime + 1];
        } else {
            kc.textContent = key[iWorkTime];
        }
    }

}