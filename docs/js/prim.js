export function primitivizeDateOnly(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
export function deprimitivizeDateOnly(date) {
    let [y, m, d] = date.split('-', 3);
    return new Date(+y, +m, +d);
}
export function primitivizeKey(key) {
    return JSON.stringify(key);
}
export function deprimitivizeKey(key) {
    return JSON.parse(key);
}
