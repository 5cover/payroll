import { Key } from "./domain";

export function primitivizeDateOnly(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
export function deprimitivizeDateOnly(date: string) {
    const [y, m, d] = date.split('-', 3);
    return new Date(+y, +m, +d);
}

export function primitivizeKey(key: Key) {
    return JSON.stringify(key);
}
export function deprimitivizeKey(key: string): Key {
    return JSON.parse(key) as Key;
}