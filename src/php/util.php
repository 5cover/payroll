<?php

/**
 * HTML5 htmlspecialchars
 * @param string $str
 * @return string
 */
function h14s(string $str): string
{
    return htmlspecialchars($str, ENT_HTML5 | ENT_QUOTES);
}

/**
 * Asserts that something is not false.
 * @template T
 * @param T|false $value Value, possibly false
 * @param ?string $msg Assertion message
 * @return T Result, not false.
 */
function notfalse(mixed $value, ?string $msg = null): mixed
{
    if ($value === false) throw new DomainException($msg ?? 'was false');
    return $value;
}
