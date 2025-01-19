<?php
require_once 'util.php';

chdir(__DIR__ . '/site');

const PHP_EXT = 'php';

array_shift($argv);

if ($argv) {
    foreach ($argv as $in) {
        generate($in, new SplFileInfo($in));
    }
} else {
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(
        '.',
        FilesystemIterator::SKIP_DOTS
    ), RecursiveIteratorIterator::SELF_FIRST) as $in => $fileInfo) {
        generate($in, $fileInfo);
    }
}

function generate(string $in, SplFileInfo $fileInfo): void
{
    $out = __DIR__ . "/../../docs/$in";
    if ($fileInfo->isDir()) {
        echo 'mkdir ' . $out . PHP_EOL;
        if (!is_dir($out)) notfalse(mkdir($out));
    } elseif ($fileInfo->getExtension() === PHP_EXT) {
        echo "ob $in $out" . PHP_EOL;
        notfalse(ob_start());
        require $in;
        notfalse(file_put_contents(substr($out, 0, -strlen(PHP_EXT)) . 'html', notfalse(ob_get_clean())));
    } else {
        echo "cp $in $out" . PHP_EOL;
        notfalse(copy($in, $out));
    }
}
