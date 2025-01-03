import { getWorkTime } from "../domain.js";
import { formatHms, insertHeaderCell } from "../util.js";
const columnCount = 5;
const headerColumnCount = 2;
const empProperties = [
    ['department', 'Department'],
    ['name', 'Name'],
    ['no', 'No.'],
    ['idNumber', 'ID Number'],
];
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
        const resultWasEmpty = this.#tableResults.rows.length == 0, warningsWasEmpty = this.#tableWarnings.rows.length == 0;
        for (const [emp, checks] of workerChecks.entries()) {
            const [workTimes, warnings] = getWorkTime(emp, checks);
            let iWorkTime = 0;
            for (const [date, workTime] of workTimes) {
                const row = this.#addResultRow(workTimes.size, iWorker, iWorkTime++, emp, date, workTime);
                const warns = warnings.get(date);
                if (warns.length > 0) {
                    this.#markResultRowWarning(row, warns);
                    for (const w of warns) {
                        this.#addWarning(row.id, w);
                    }
                }
            }
            if (iWorkTime < empProperties.length) {
                const hr = this.#addKeyPaddingRow(iWorkTime, emp);
                const padc = hr.insertCell();
                padc.rowSpan = empProperties.length - iWorkTime++;
                padc.colSpan = columnCount - hr.cells.length + 1;
            }
            while (iWorkTime < empProperties.length) {
                this.#addKeyPaddingRow(iWorkTime++, emp);
            }
            this.#tableResults.insertRow().insertCell().colSpan = columnCount;
            iWorker++;
        }
        if (resultWasEmpty)
            this.#addResultHeader();
        if (warningsWasEmpty)
            this.#addWarningHeader();
    }
    #addKeyPaddingRow(iWorkTime, emp) {
        const hr = this.#tableResults.insertRow();
        this.#fillHeaderRow(hr, iWorkTime, emp);
        return hr;
    }
    #addResultHeader() {
        this.#tableResults.createCaption().textContent = 'Work times';
        if (this.#tableResults.rows.length > 0) {
            const row = this.#tableResults.insertRow(0);
            const thKey = insertHeaderCell(row);
            thKey.colSpan = headerColumnCount;
            thKey.textContent = 'Employee';
            insertHeaderCell(row).textContent = '#';
            insertHeaderCell(row).textContent = 'Date';
            insertHeaderCell(row).textContent = 'Work time';
        }
    }
    #addWarningHeader() {
        this.#tableWarnings.createCaption().textContent = 'Warnings';
        if (this.#tableWarnings.rows.length > 0) {
            const row = this.#tableWarnings.insertRow(0);
            insertHeaderCell(row).textContent = 'Actions';
            insertHeaderCell(row).textContent = 'Location';
            insertHeaderCell(row).textContent = 'Message';
        }
    }
    #addResultRow(size, iWorker, iWorkTime, emp, date, workedFor) {
        const row = this.#tableResults.insertRow();
        if (iWorkTime < empProperties.length) {
            this.#fillHeaderRow(row, iWorkTime, emp);
        }
        else if (iWorkTime == empProperties.length) {
            const padc = row.insertCell();
            padc.colSpan = headerColumnCount;
            padc.rowSpan = size - empProperties.length;
        }
        row.insertCell().textContent = row.id = this.#rowId(iWorker, iWorkTime);
        row.insertCell().textContent = date.toLocaleDateString();
        row.insertCell().textContent = formatHms(workedFor);
        return row;
    }
    #markResultRowWarning(row, warnings) {
        for (let i = row.cells.length - 1; i > row.cells.length - columnCount + headerColumnCount; --i) {
            const c = row.cells.item(i);
            c.className = 'bg-warning';
            c.title = warnings.join('\n');
        }
    }
    #addWarning(rowId, warning) {
        const row = this.#tableWarnings.insertRow();
        row.insertCell();
        row.insertCell().innerHTML = `<a href="#${rowId}">${rowId}</a>`;
        row.insertCell().textContent = warning;
    }
    #fillHeaderRow(row, iWorkTime, emp) {
        const [prop, name] = empProperties[iWorkTime];
        insertHeaderCell(row).textContent = name;
        const kc = row.insertCell();
        if (prop === 'idNumber') {
            kc.textContent = emp[prop][0] + emp[prop][1];
        }
        else {
            kc.textContent = emp[prop];
        }
    }
    #rowId(iWorker, iWorkTime) {
        return `${iWorker + 1}.${iWorkTime + 1}`;
    }
}
