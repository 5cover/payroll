<?php

/**
 * @property-read string $latestVersion
 */
final class Changelog
{
    private static ?Changelog $instance;
    /**
     * Summary of versions
     * @var object[]
     */
    readonly array $versions;

    private function __construct(array $versions)
    {
        krsort($versions);
        $this->versions = $versions;
    }

    static function get(): Changelog
    {
        return self::$instance ??= new Changelog((array)json_decode(
            file_get_contents(__DIR__ . '/../../data/changelog.json')));
    }

    function __get(string $name): mixed
    {
        return match ($name) {
            'latestVersion' => array_key_first($this->versions),  // is alphabetic comparison enough?
        };
    }
}
