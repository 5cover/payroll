<?php
require_once 'util.php';
require_once 'const.php';

final class Page
{
    private const BASE_STYLESHEETS = [
        'base.css',
    ];

    private const BASE_SCRIPTS = [];

    /**
     * @param string $title
     * @param string[] $stylesheets
     * @param string[] $scripts
     */
    function __construct(
        private readonly string $title,
        private readonly array $stylesheets = [],
        private readonly array $scripts     = [],
    ) {}

    /**
     * Summary of put
     * @param callable(): void|string $put_main
     * @return void
     */
    function put(callable|string $put_main)
    {
        ?>
<!DOCTYPE html>
<html lang="en">
<?php $this->put_head() ?>
<body>
    <?php $this->put_header() ?>
    <main><?php is_string($put_main) ? (print $put_main) : $put_main() ?></main>
    <?php $this->put_footer() ?>
</body>
</html>
<?php
    }

    private function put_head(): void
    {
?>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= SITE_NAME ?> &ndash; <?= h14s($this->title) ?></title>
    <?php
    foreach (array_merge(self::BASE_STYLESHEETS, $this->stylesheets) as $href) {
        ?><link rel="stylesheet" href="<?= SITE_BASE_URL ?>/css/<?= $href ?>"><?php
    }
    ?>
    <?php
    foreach (array_merge(self::BASE_SCRIPTS, $this->scripts) as $src) {
        ?><script type="module" src="<?= SITE_BASE_URL ?>/js/<?= $src ?>"></script><?php
    }
    ?>
</head>
<?php
    }

    private function put_header(): void
    {
?>
<header>
    <nav>
        <ul>
            <li><a href="<?= SITE_BASE_URL ?>">Home</a></li>
            <li><a href="<?= SITE_BASE_URL ?>/working-hours">Working hours</a></li>
            <li><a href="<?= SITE_BASE_URL ?>/production">Production</a></li>
        </ul>
    </nav>
    <p>Version 1.1.4 (<a href="<?= SITE_BASE_URL ?>/changelog.html">Changelog</a>)</p>
</header>
<?php
    }

    private function put_footer(): void
    {
?>
<footer>
</footer>
<?php
    }
}
