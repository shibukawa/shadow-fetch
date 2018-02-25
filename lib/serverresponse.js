const { Headers } = require("./headers");
const { bodyKey, jsonKey, formKey } = require("./incomingmessage");


class ServerResponse {
    constructor(onfinish) {
        this.statusCode = 200;
        this.statusMessage = "";
        this._headers = new Headers();
        this._trailers = null;
        this.output = [];
        this._onfinish = onfinish;
        this.sendDate = false;
        this.headersSent = false;
        this._readableStream = null;
        this._drainListener = null;
    }

    on(eventName, handler) {
        if (eventName === "drain") {
            this._drainListener = handler;
        }
    }

    emit(eventName, arg) {
        if (eventName === "pipe") {
            this._readableStream = arg;
            this._drainListener();
        }
    }

    once() {
    }

    removeListener() {
    }

    pipe() {
        throw new Error("Can't call ServerResponse's pipe because it is not readable");
    }

    addTrailers(headers) {
        this._trailers = headers;
    }

    getHeader(name) {
        return this._headers.get(name);
    }

    getHeaderNames() {
        return Array.from(this._headers.keys());
    }

    getHeaders() {
        return this._headers.entries();
    }

    hasHeader(name) {
        return this._headers.has(name);
    }

    removeHeader(name) {
        if (this.headersSent) {
            throw new Error("[ERR_HTTP_HEADERS_SENT]: Cannot remove headers after they are sent to the client");
        } else {
            this._headers.delete(name);
        }
    }

    setHeader(name, value) {
        if (this.headersSent) {
            throw new Error("[ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client");
        } else {
            this._headers.set(name, value);
        }
    }

    listeners() {
        return [];
    }

    writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        if (headers) {
            for (const [name, value] of Object.entries(headers)) {
                this._headers.set(name, value);
            }
        }
    }

    write(chunk, encoding, callback) {
        if (encoding) {
            throw new Error("not implemented: encoding of write()");
        }
        if (callback) {
            throw new Error("not implemented: callback of write()");
        }
        this.output.push(chunk);
        return true;
    }

    end(chunk, encoding, callback) {
        if (encoding) {
            throw new Error("not implemented: encoding of write()");
        }
        if (callback) {
            throw new Error("not implemented: callback of write()");
        }
        if (chunk) {
            this.output.push(chunk);
        }
        this._onfinish(this);
    }

    writeJSON(json) {
        this[jsonKey] = json;
    }
}

module.exports = {
    ServerResponse
};
