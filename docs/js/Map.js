export class DefaultPrimitiveMap extends Map {
    #defaultFactory;
    constructor(defaultFactory) {
        super();
        this.#defaultFactory = defaultFactory;
    }
    map(key, transform) {
        this.set(key, transform(this.get(key)));
    }
    get(key) {
        const value = super.get(key);
        if (value !== undefined) {
            return value;
        }
        const def = this.#defaultFactory();
        this.set(key, def);
        return def;
    }
}
export class DefaultObjectMap {
    #ktop;
    #ptok;
    #map;
    constructor(defaultFactory, keyToPrim, primToKey) {
        this.#ktop = keyToPrim;
        this.#ptok = primToKey;
        this.#map = new DefaultPrimitiveMap(defaultFactory);
    }
    map(key, transform) {
        this.set(key, transform(this.get(key)));
    }
    get size() {
        return this.#map.size;
    }
    clear() {
        this.#map.clear();
    }
    delete(key) {
        return this.#map.delete(this.#ktop(key));
    }
    forEach(callbackfn, thisArg) {
        this.#map.forEach((v, k) => callbackfn.call(thisArg === undefined ? this : thisArg, v, this.#ptok(k), this));
    }
    get(key) {
        return this.#map.get(this.#ktop(key));
    }
    has(key) {
        return this.#map.has(this.#ktop(key));
    }
    set(key, value) {
        this.#map.set(this.#ktop(key), value);
        return this;
    }
    *entries() {
        for (const [k, v] of this.#map.entries()) {
            yield [this.#ptok(k), v];
        }
    }
    *keys() {
        for (const k of this.#map.keys()) {
            yield this.#ptok(k);
        }
    }
    values() {
        return this.#map.values();
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    get [Symbol.toStringTag]() {
        return this.#map[Symbol.toStringTag];
    }
}
export class ObjectMap {
    #ktop;
    #ptok;
    #map;
    constructor(keyToPrim, primToKey) {
        this.#ktop = keyToPrim;
        this.#ptok = primToKey;
        this.#map = new Map();
    }
    get size() {
        return this.#map.size;
    }
    clear() {
        this.#map.clear();
    }
    delete(key) {
        return this.#map.delete(this.#ktop(key));
    }
    forEach(callbackfn, thisArg) {
        this.#map.forEach((v, k) => callbackfn.call(thisArg === undefined ? this : thisArg, v, this.#ptok(k), this));
    }
    get(key) {
        return this.#map.get(this.#ktop(key));
    }
    has(key) {
        return this.#map.has(this.#ktop(key));
    }
    set(key, value) {
        this.#map.set(this.#ktop(key), value);
        return this;
    }
    *entries() {
        for (const [k, v] of this.#map.entries()) {
            yield [this.#ptok(k), v];
        }
    }
    *keys() {
        for (const k of this.#map.keys()) {
            yield this.#ptok(k);
        }
    }
    values() {
        return this.#map.values();
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    get [Symbol.toStringTag]() {
        return this.#map[Symbol.toStringTag];
    }
}
