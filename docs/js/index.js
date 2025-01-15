import { requireElementById, parseExcel, parseCsv, formatHms } from './util.js';
import { parseWorkerChecks, minWorkTime, maxWorkTime } from './domain.js';
import ResultView from './component/ResultView.js';
import Result from './model/Result.js';
const inputFile = requireElementById('input-file');
const pInputError = requireElementById('p-input-error');
const buttonClear = requireElementById('button-clear');
const resultTable = new ResultView(requireElementById('table-results'), requireElementById('table-warnings'));
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
            const result = new Result(parseWorkerChecks(await parseSpreadsheet(file)));
            resultTable.addResult(result);
        }
    })();
});
async function parseSpreadsheet(file) {
    const isCsv = file.type === 'text/csv';
    try {
        return isCsv
            ? parseCsv(await file.text())
            : await parseExcel(file);
    }
    catch (e) {
        pInputError.textContent = 'Failed to import the badges sheet. '
            + (isCsv ? '' : 'You can try exporting it to CSV and importing that instead. ')
            + String(e);
        throw e;
    }
}
