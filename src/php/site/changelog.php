<?php
require_once 'Page.php';

$page = new Page('Changelog', ['changelog.css']);

$page->put(function () {
?>
<h1>Changelog</h1>
<search>
    <h2>1.1.4</h2>
    <p>18/01/2025</p>
    <article>
        <h3>New features</h3>
        <ul>
            <li>Global warning state switch</li>
        </ul>
    </article>
</search>
<section>
    <h2>1.1.3</h2>
    <p>17/01/2025</p>
    <article>
        <h3>New features</h3>
        <ul>
            <li>Clear confirmation for sizeable results</li>
            <li>XLSX export</li>
        </ul>
    </article>
</section>
<section>
    <h2>1.1.2</h2>
    <p>16/01/2025</p>
    <article>
        <h3>New features</h3>
        <ul>
            <li>Resolve warnings</li>
        </ul>
    </article>
</section>
<section>
    <h2>1.1.1</h2>
    <p>11/01/2025</p>
    <article>
        <h3>New features</h3>
        <ul>
            <li>Total employee work time</li>
        </ul>
    </article>
</section>
<section>
    <h2>1.1.0</h2>
    <p>27/12/2024</p>
    <article>
        <h3>New features</h3>
        <ul>
            <li>Waning summary</li>
        </ul>
        <h3>Changes</h3>
        <ul>
            <li>Double badges are no longer reported</li>
        </ul>
    </article>
</section>
<section>
    <h2>1.0.1</h2>
    <p>26/12/2024</p>
    <article>
        <h3>New features</h3>
        <ul>
            <li>Result header row</li>
            <li>Warnings: double badge on entrance (&lt;10min work period) and forgot to badge exit (&gt;10h work period)</li>
        </ul>
    </article>
    <article>
        <h3>Changes</h3>
        <ul>
            <li>Improved ergonomy: better error messages, ID number reunited</li>
        </ul>
    </article>
    <article>
        <h3>Bufixes</h3>
        <ul>
            <li>Fixed XLS calculation errors</li>
        </ul>
    </article>
</section>
<section>
    <h2>1.0.0</h2>
    <p>24/12/2024</p>
    <p>Initial version</p>
</section>
<?php
});
