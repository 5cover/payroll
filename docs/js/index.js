import { requireElementById, parseExcel, parseCsv, formatHms } from './util.js';
import { getResults, parseWorkerChecks, minWorkTime, maxWorkTime } from './domain.js';
import ResultsView from './component/ResultsView.js';
const inputFile = requireElementById('input-file');
const pInputError = requireElementById('p-input-error');
const buttonClear = requireElementById('button-clear');
const resultTable = new ResultsView(requireElementById('table-results'), requireElementById('table-warnings'));
requireElementById('span-min-work-time').textContent = formatHms(minWorkTime);
requireElementById('span-max-work-time').textContent = formatHms(maxWorkTime);
buttonClear.addEventListener('click', () => {
    buttonClear.disabled = true;
    resultTable.clear();
});
inputFile.addEventListener('change', function () {
    void (async () => {
        if (!this.files)
            return;
        buttonClear.disabled = false;
        if (resultTable.isEmpty) {
            resultTable.addHeaders();
        }
        for (const file of this.files ?? []) {
            const results = getResults(parseWorkerChecks(await parseSpreadsheet(file)));
            resultTable.addResults(results);
        }
    })();
});
async function parseSpreadsheet(file) {
    try {
        return file.type === 'text/csv'
            ? parseCsv(await file.text())
            : await parseExcel(file);
    }
    catch (e) {
        pInputError.textContent = 'Failed to import the badges sheet. You can try exporting it to CSV and importing that instead. ' + String(e);
        throw e;
    }
}
