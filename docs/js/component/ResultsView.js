import { getWarningMessage } from "../domain.js";
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
    #resultsCount = 0;
    constructor(resultTable, warningsTable) {
        this.#tableResults = resultTable;
        this.#tableWarnings = warningsTable;
    }
    clear() {
        this.#tableResults.textContent = '';
        this.#tableWarnings.textContent = '';
        this.#resultsCount = 0;
    }
    get isEmpty() {
        return this.#tableResults.rows.length == 0;
    }
    addResults(result) {
        let iWorker = this.#resultsCount++;
        for (const [emp, shifts] of result.entries()) {
            let totalWorkTime = 0;
            let iShift = 0;
            for (const [date, shift] of shifts.entries()) {
                totalWorkTime += shift.workTime;
                const row = this.#addResultRow(shifts.size, iWorker, iShift++, emp, date, shift.workTime);
                if (shift.warnings.length > 0) {
                    const messages = shift.warnings.map(getWarningMessage);
                    this.#markResultRowWarning(row, messages);
                    this.#addWarning(row.id, messages);
                }
            }
            if (iShift < empProperties.length) {
                const hr = this.#addKeyPaddingRow(iShift, emp);
                const padc = hr.insertCell();
                padc.rowSpan = empProperties.length - iShift++;
                padc.colSpan = columnCount - hr.cells.length + 1;
            }
            while (iShift < empProperties.length) {
                this.#addKeyPaddingRow(iShift++, emp);
            }
            const totalRow = this.#tableResults.insertRow();
            const totalHeaderCell = insertHeaderCell(totalRow);
            totalHeaderCell.textContent = 'Total';
            totalHeaderCell.colSpan = 4;
            totalRow.insertCell().textContent = formatHms(totalWorkTime);
            this.#tableResults.insertRow().insertCell().colSpan = columnCount;
            iWorker++;
        }
    }
    #addKeyPaddingRow(iShift, emp) {
        const hr = this.#tableResults.insertRow();
        this.#fillHeaderRow(hr, iShift, emp);
        return hr;
    }
    addHeaders() {
        this.#tableResults.createCaption().textContent = 'Shifts';
        {
            const row = this.#tableResults.insertRow(0);
            const thKey = insertHeaderCell(row);
            thKey.colSpan = headerColumnCount;
            thKey.textContent = 'Employee';
            insertHeaderCell(row).textContent = '#';
            insertHeaderCell(row).textContent = 'Date';
            insertHeaderCell(row).textContent = 'Work time';
        }
        this.#tableWarnings.createCaption().textContent = 'Warnings';
        {
            const row = this.#tableWarnings.insertRow(0);
            insertHeaderCell(row).textContent = 'Actions';
            insertHeaderCell(row).textContent = 'Location';
            insertHeaderCell(row).textContent = 'Message';
        }
    }
    #addResultRow(size, iWorker, iShift, emp, date, workTime) {
        const row = this.#tableResults.insertRow();
        if (iShift < empProperties.length) {
            this.#fillHeaderRow(row, iShift, emp);
        }
        else if (iShift == empProperties.length) {
            const padc = row.insertCell();
            padc.colSpan = headerColumnCount;
            padc.rowSpan = size - empProperties.length;
        }
        row.insertCell().textContent = row.id = this.#rowId(iWorker, iShift);
        row.insertCell().textContent = date.toLocaleDateString();
        row.insertCell().textContent = formatHms(workTime);
        return row;
    }
    #markResultRowWarning(row, messages) {
        for (let i = row.cells.length - 1; i > row.cells.length - columnCount + headerColumnCount; --i) {
            const c = row.cells.item(i);
            c.className = 'bg-warning';
            c.title = messages.join('\n');
        }
    }
    #addWarning(rowId, messages) {
        const row = this.#tableWarnings.insertRow();
        row.insertCell();
        row.insertCell().innerHTML = `<a href="#${rowId}">${rowId}</a>`;
        row.insertCell().innerHTML = messages.join('<br>');
    }
    #fillHeaderRow(row, iShift, emp) {
        const [prop, name] = empProperties[iShift];
        insertHeaderCell(row).textContent = name;
        const kc = row.insertCell();
        if (prop === 'idNumber') {
            kc.textContent = emp[prop][0] + emp[prop][1];
        }
        else {
            kc.textContent = emp[prop];
        }
    }
    #rowId(iWorker, iShift) {
        return `${iWorker + 1}.${iShift + 1}`;
    }
}
