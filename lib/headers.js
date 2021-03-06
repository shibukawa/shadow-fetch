// this code is based on https://github.com/github/fetch/blob/master/fetch.js

function normalizeName(name) {
    if (typeof name !== "string") {
        name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
        throw new TypeError("Invalid character in header field name");
    }
    return name.toLowerCase();
}

function normalizeValue(value) {
    if (typeof value !== "string") {
        value = String(value);
    }
    return value;
}


class Headers {
    constructor(headers) {
        this._map = new Map();
        this._clientMode = true;
        if (headers instanceof Headers) {
            for (const [name, value] of headers.entries()) {
                this._map.set(name, value);
            }
        } else if (Array.isArray(headers)) {
            for (const [name, value] of headers) {
                this._map.set(name, value);
            }
        } else if (headers) {
            for (const [name, value] of Object.entries(headers)) {
                this._map.set(normalizeName(name), normalizeValue(value));
            }
        }
    }

    append(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this._map.get(name);
        this._map.set(name, oldValue ? oldValue + ", " + value : value);
    }

    delete(name) {
        return this._map.delete(normalizeName(name));
    }

    get(name) {
        name = normalizeName(name);
        if (this._map.has(name)) {
            return this._map.get(name);
        }
        return null;
    }

    has(name) {
        return this._map.has(normalizeName(name));
    }

    set(name, value) {
        if (this._clientMode) {
            this._map.set(normalizeName(name), normalizeValue(value));
        } else {
            this._map.set(normalizeName(name), value);
        }
        return this;
    }

    forEach(callback, thisArg) {
        this._map.forEach(callback, thisArg);
    }

    keys() {
        return this._map.keys();
    }

    values() {
        return this._map.values();
    }

    entries() {
        return this._map.entries();
    }
}

const convertToClientMode = (headers) => {
    for (const [key, value] of headers.entries()) {
        if (Array.isArray(value)) {
            headers._map.set(key, value.join(", "));
        }
    }
};

const convertToServerHeaders = (headers) => {
    const serverHeaders = {};
    const serverRawHeaders = [];
    for (const [name, value] of headers.entries()) {
        serverHeaders[name] = value;
        serverRawHeaders.push(name, value);
    }

    return {
        headers: serverHeaders,
        rawHeaders: serverRawHeaders
    };
};

module.exports = {
    Headers,
    convertToClientMode,
    convertToServerHeaders
};
