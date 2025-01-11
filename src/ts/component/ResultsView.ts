import { Employee, getWarningMessage, WorkTime } from "../domain.js";
import { DefaultMap } from "../Map.js";
import { formatHms, insertHeaderCell } from "../util.js";

const columnCount = 5;
const headerColumnCount = 2;

const empProperties: [keyof Employee, string][] = [
    ['department', 'Department'],
    ['name', 'Name'],
    ['no', 'No.'],
    ['idNumber', 'ID Number'],
];

export default class ResultsView {
    readonly #tableResults: HTMLTableElement;
    readonly #tableWarnings: HTMLTableElement;
    
    #resultsCount = 0;

    constructor(resultTable: HTMLTableElement, warningsTable: HTMLTableElement) {
        this.#tableResults = resultTable;
        this.#tableWarnings = warningsTable;
    }

    clear() {
        this.#tableResults.textContent = '';
        this.#tableWarnings.textContent = '';
    }

    get isEmpty() {
        return this.#tableResults.rows.length == 0;
    }

    addResults(result: Map<Employee, DefaultMap<Date, WorkTime>>) {
        let iWorker = this.#resultsCount++;
        
        for (const [emp, workTimes] of result.entries()) {
            let totalWorkTime = 0;
            let iWorkTime = 0;
            for (const [date, workTime] of workTimes.entries()) {
                totalWorkTime += workTime.workedFor;
                const row = this.#addResultRow(workTimes.size, iWorker, iWorkTime++, emp, date, workTime.workedFor);

                if (workTime.warning !== undefined) {
                    const msg = getWarningMessage(workTime.warning);
                    this.#markResultRowWarning(row, msg);
                    this.#addWarning(row.id, msg);
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

            const totalRow = this.#tableResults.insertRow();
            const totalHeaderCell = insertHeaderCell(totalRow);
            totalHeaderCell.textContent = 'Total';
            totalHeaderCell.colSpan = 4;
            totalRow.insertCell().textContent = formatHms(totalWorkTime);

            // margin row
            this.#tableResults.insertRow().insertCell().colSpan = columnCount;

            iWorker++;
        }
    }

    #addKeyPaddingRow(iWorkTime: number, emp: Employee) {
        const hr = this.#tableResults.insertRow();
        this.#fillHeaderRow(hr, iWorkTime, emp);
        return hr;
    }

    addHeaders() {
        this.#tableResults.createCaption().textContent = 'Work times';
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

    #addResultRow(size: number, iWorker: number, iWorkTime: number, emp: Employee, date: Date, workedFor: number) {
        const row = this.#tableResults.insertRow();
        if (iWorkTime < empProperties.length) {
            this.#fillHeaderRow(row, iWorkTime, emp);
        } else if (iWorkTime == empProperties.length) {
            const padc = row.insertCell();
            padc.colSpan = headerColumnCount;
            padc.rowSpan = size - empProperties.length;
        }
        row.insertCell().textContent = row.id = this.#rowId(iWorker, iWorkTime);
        row.insertCell().textContent = date.toLocaleDateString();
        row.insertCell().textContent = formatHms(workedFor);
        return row;
    }

    #markResultRowWarning(row: HTMLTableRowElement, msg: string) {
        for (let i = row.cells.length - 1; i > row.cells.length - columnCount + headerColumnCount; --i) {
            const c = row.cells.item(i)!;
            c.className = 'bg-warning';
            c.title = msg;
        }
    }

    #addWarning(rowId: string, message: string) {
        const row = this.#tableWarnings.insertRow();
        row.insertCell();//.innerHTML = `<button type="button">Allow</button>`; // todo
        row.insertCell().innerHTML = `<a href="#${rowId}">${rowId}</a>`;
        row.insertCell().textContent = message;
    }

    #fillHeaderRow(row: HTMLTableRowElement, iWorkTime: number, emp: Employee) {
        const [prop, name] = empProperties[iWorkTime];
        insertHeaderCell(row).textContent = name;
        const kc = row.insertCell();
        if (prop === 'idNumber') {
            kc.textContent = emp[prop][0] + emp[prop][1];
        } else {
            kc.textContent = emp[prop];
        }
    }

    #rowId(iWorker: number, iWorkTime: number) {
        return `${iWorker + 1}.${iWorkTime + 1}`;
    }

}