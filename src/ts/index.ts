import { requireElementById, parseExcel, parseCsv } from './util.js';
import { parseWorkerChecks, } from './domain.js';
import ResultsView from './component/ResultsView.js';

const inputFile = requireElementById('input-file') as HTMLInputElement;
const pInputError = requireElementById('p-input-error');
const buttonClear = requireElementById('button-clear') as HTMLButtonElement;

const resultTable = new ResultsView(
    requireElementById('table-results') as HTMLTableElement,
    requireElementById('table-warnings') as HTMLTableElement,
);


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
            } catch (e) {
                pInputError.textContent = 'Failed to import the badges sheet. You can try exporting it to CSV and importing that instead. ' + String(e);
                throw e;
            }
        }
    })();
});

