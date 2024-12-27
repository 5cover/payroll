import { requireElementById, parseExcel, parseCsv } from './util.js';
import { parseWorkerChecks, } from './domain.js';
import ResultTable from './component/ResultTable.js';
const inputFile = requireElementById('input-file');
//const tableWarnings = requireElementById('table-warnings') as HTMLTableElement;
const pInputError = requireElementById('p-input-error');
const buttonClear = requireElementById('button-clear');
const resultTable = new ResultTable(requireElementById('table-results'));
buttonClear.addEventListener('click', () => {
    buttonClear.disabled = true;
    resultTable.clear();
});
inputFile.addEventListener('change', function () {
    void (async () => {
        buttonClear.disabled = false;
        for (const file of this.files ?? []) {
            try {
                const result = file.type === 'text/csv'
                    ? parseCsv(await file.text())
                    : await parseExcel(file);
                resultTable.addResult(parseWorkerChecks(result));
            }
            catch (e) {
                pInputError.textContent = 'Failed to import the badges sheet. You can try exporting it to CSV and importing that instead. ' + e;
                return;
            }
        }
    })();
});
