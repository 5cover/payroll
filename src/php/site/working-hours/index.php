<?php
require_once 'Page.php';
$page = new Page('Working hours', ['working-hours/index.css'], ['working-hours/index.js']);
$page->put(function () {
?>
<h1>Working hours calculator</h1>
<h2>1. Upload the working hours sheet</h2>
<p><em>Multiple files can be imported at once. All processing is done locally.</em></p>
<p>
    <input type="file" id="input-file" accept=".xls,.xlsx,.csv,text/csv" multiple>
</p>
<p id="p-input-error" class="error"></p>
<h2>2. Results</h2>
<p>Min work time: <span id="span-min-work-time"></span> (shorter shifts are ignored)</p>
<p>Resolving warnings:</p>
<ul id="list-warning-actions">
    <li>Forbid (ignore shift)</li>
    <li>Cap (consider max work time of <span id="span-max-work-time"></span>)</li>
    <li>Allow (consider whole shift)</li>
</ul>
<hr>
<p><button type="button" id="button-clear" disabled>Clear</button> <button type="button" id="button-export" disabled>Export XLSX</button></p>
<section id="section-results">
    <table id="table-results"></table>
    <table id="table-warnings"></table>
</section>
<?php
});
