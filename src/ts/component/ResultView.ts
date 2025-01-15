import { Employee, getWarningMessage, Shift } from "../domain.js";
import Result from "../model/Result.js";
import RowId from "../RowId.js";
import { formatHms, insertHeaderCell } from "../util.js";
import WarningView from "./WarningView.js";

const columnCount = 5;
const headerColumnCount = 2;

const empProperties: [keyof Employee, string][] = [
    ['department', 'Department'],
    ['name', 'Name'],
    ['no', 'No.'],
    ['idNumber', 'ID Number'],
];

export default class ResultView {
    readonly #tableResults: HTMLTableElement;
    readonly #tableWarnings: HTMLTableElement;

    #resultCount = 0;

    constructor(resultTable: HTMLTableElement, warningsTable: HTMLTableElement) {
        this.#tableResults = resultTable;
        this.#tableWarnings = warningsTable;
    }

    clear() {
        this.#tableResults.textContent = '';
        this.#tableWarnings.textContent = '';
        this.#resultCount = 0;
    }

    get isEmpty() {
        return this.#tableResults.rows.length == 0;
    }

    addResult(result: Result) {

        const rowId = new RowId(this.#resultCount++, 0);

        for (const [emp, shifts] of result.employeeShifts) {
            let totalWorkTime = 0;
            rowId.iShift = 0;
            for (const [day, shift] of shifts.entries()) {
                totalWorkTime += shift.workTime;
                const row = this.#addResultRow(shifts.size, rowId, emp, day, shift);

                if (shift.warnings.length > 0) {
                    this.#markResultRowWarning(row, shift.warnings.map(getWarningMessage));
                    

                    for (const w of shift.warnings) {
                        const view = new WarningView(result, emp, day, w);
                        row.insertCell().appendChild(view.createSwitchElement(rowId));
                        this.#addWarning(rowId, view);
                    }

                    shift.workTimeChanged.push(old => tdTotal.textContent = formatHms(totalWorkTime += shift.workTime - old));
                }

                rowId.iShift++;
            }

            if (rowId.iShift < empProperties.length) {
                const hr = this.#addKeyPaddingRow(rowId, emp);
                const padc = hr.insertCell();
                padc.rowSpan = empProperties.length - rowId.iShift++;
                padc.colSpan = columnCount - hr.cells.length + 1;
            }
            while (rowId.iShift < empProperties.length) {
                this.#addKeyPaddingRow(rowId, emp);
                rowId.iShift++;
            }

            const totalRow = this.#tableResults.insertRow();
            const thTotal = insertHeaderCell(totalRow);
            thTotal.textContent = 'Total';
            thTotal.colSpan = 4;
            const tdTotal = totalRow.insertCell();
            tdTotal.textContent = formatHms(totalWorkTime);
            totalRow.appendChild(tdTotal);

            // margin row
            this.#tableResults.insertRow().insertCell().colSpan = columnCount;

            rowId.iWorker++;
        }
    }

    #addKeyPaddingRow(rowId: RowId, emp: Employee) {
        const hr = this.#tableResults.insertRow();
        this.#fillHeaderRow(hr, rowId, emp);
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

    #addResultRow(size: number, rowId: RowId, emp: Employee, date: Date, shift: Shift) {
        const row = this.#tableResults.insertRow();
        if (rowId.iShift < empProperties.length) {
            this.#fillHeaderRow(row, rowId, emp);
        } else if (rowId.iShift == empProperties.length) {
            const padc = row.insertCell();
            padc.colSpan = headerColumnCount;
            padc.rowSpan = size - empProperties.length;
        }
        row.insertCell().textContent = row.id = rowId.toString();
        row.insertCell().textContent = date.toLocaleDateString();
        const tdWorkTime = row.insertCell();
        tdWorkTime.textContent = formatHms(shift.workTime);
        shift.workTimeChanged.push(() => tdWorkTime.textContent = formatHms(shift.workTime));
        return row;
    }

    #markResultRowWarning(row: HTMLTableRowElement, messages: string[]) {
        for (let i = row.cells.length - 1; i > row.cells.length - columnCount + headerColumnCount; --i) {
            const c = row.cells.item(i)!;
            c.className = 'bg-warning';
            c.title = messages.join('\n');
        }
    }

    #addWarning(rowId: RowId, view: WarningView) {
        const row = this.#tableWarnings.insertRow();
        row.insertCell().appendChild(view.createSwitchElement(rowId));
        row.insertCell().innerHTML = `<a href="#${rowId.toString()}">${rowId.toString()}</a>`;
        row.insertCell().textContent = getWarningMessage(view.warning);
    }

    #fillHeaderRow(row: HTMLTableRowElement, rowId: RowId, emp: Employee) {
        const [prop, name] = empProperties[rowId.iShift];
        insertHeaderCell(row).textContent = name;
        const kc = row.insertCell();
        if (prop === 'idNumber') {
            kc.textContent = emp[prop][0] + emp[prop][1];
        } else {
            kc.textContent = emp[prop];
        }
    }
}