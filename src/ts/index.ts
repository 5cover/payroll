import { requireElementById, parseExcel, parseCsv, formatHms } from './util.js';
import { parseWorkerChecks, minWorkTime, maxWorkTime } from './domain.js';
import ResultView from './component/ResultView.js';
import Result from './model/Result.js';
import { writeFileXLSX } from './lib/xlsx.js';

const maxUnconfirmedClearRows = 20;

const inputFile = requireElementById('input-file') as HTMLInputElement;
const pInputError = requireElementById('p-input-error');
const buttonClear = requireElementById('button-clear') as HTMLButtonElement;
const buttonExport = requireElementById('button-export') as HTMLButtonElement;

const resultView = new ResultView(
    requireElementById('table-results') as HTMLTableElement,
    requireElementById('table-warnings') as HTMLTableElement,
);

requireElementById('span-min-work-time').textContent = formatHms(minWorkTime);
requireElementById('span-max-work-time').textContent = formatHms(maxWorkTime);

buttonClear.addEventListener('click', () => {
    if (resultView.rowCount > maxUnconfirmedClearRows && !confirm(`Are you sure? This will remove ${resultView.rowCount} rows`))
        return;
    buttonClear.disabled = buttonExport.disabled = true;
    resultView.clear();
});

buttonExport.addEventListener('click', () => writeFileXLSX(resultView.toWorkBook(), 'result.xslx'));

inputFile.addEventListener('change', function () {
    void (async () => {
        if (!this.files) return;
        buttonClear.disabled = buttonExport.disabled = false;
        if (resultView.rowCount === 0) {
            resultView.addHeaders();
        }
        for (const file of this.files ?? []) {
            const result = new Result(parseWorkerChecks(await parseSpreadsheet(file)));
            resultView.addResult(result);
        }
    })();
});
async function parseSpreadsheet(file: File) {
    const isCsv = file.type === 'text/csv';
    try {
        return isCsv
            ? parseCsv(await file.text())
            : await parseExcel(file);
    } catch (e) {
        pInputError.textContent = 'Failed to import the badges sheet. '
            + (isCsv ? '' : 'You can try exporting it to CSV and importing that instead. ')
            + String(e);
        throw e;
    }
}


