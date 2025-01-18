<?php
require_once 'util.php';
require_once 'Page.php';
require_once 'Changelog.php';

$page = new Page('Changelog', ['changelog.css']);

$page->put(function () {
    ?>
    <h1>Changelog</h1><?php
    foreach (Changelog::get()->versions as $name => $version) {
        ?>
        <section>
            <h2><?= h14s($name) ?></h2>
            <p><?= date_create_from_format('Y-m-d', $version->date)->format('d/m/Y') ?></p>
            <?php if ($d = $version->description ?? null) { ?>
                <p><?= $d ?></p><?php
        }
        put_list($version->newFeatures ?? [], 'New features');
        put_list($version->changes ?? [], 'Changes');
        put_list($version->bugfixes ?? [], 'Bugfixes');
        ?>
        </section>
        <?php
    }
});

function put_list(array $list, string $name)
{
    if (count($list) === 0)
        return;
    ?>
    <article>
        <h3><?= h14s($name) ?></h3>
        <ul><?php foreach ($list as $item) { ?>
                <li><?= h14s($item) ?></li><?php } ?>
        </ul>
    </article>
    <?php
}
