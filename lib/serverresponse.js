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
        this._listeners = {
            close: null,
            drain: null,
            error: null,
            finish: null,
            pipe: null,
            unpipe: null
        };
        this._readableStream;
    }

    get shadow() {
        return true;
    }

    on(eventName, listener) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            throw new Error(`Unsupported event: '${eventName}'`);
        }
        this._listeners[eventName] = { listener, once: false };
    }

    once(eventName, listener) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            throw new Error(`Unsupported event: '${eventName}'`);
        }
        this._listeners[eventName] = { listener, once: true };
    }

    emit(eventName, arg) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            throw new Error(`Unsupported event: '${eventName}'`);
        }
        this._emit(eventName, arg);
        if (eventName === "pipe") {
            if (!this._listeners.unpipe) {
                // Stream v1
                arg.on("data", (arg) => {
                    this.write(arg);
                });
            }
            this._readableStream = arg;
            this._emit("drain", arg);
        }
    }

    _emit(eventName, arg) {
        if (this._listeners[eventName]) {
            const { listener, once } = this._listeners[eventName];
            listener(arg);
            if (once) {
                delete this._listeners[eventName];
            }
        }
    }

    removeListener(eventName, listener) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            throw new Error(`Unsupported event: '${eventName}'`);
        }
        if (this._listeners[eventName] && this._listeners[eventName].listener === listener) {
            delete this._listeners[eventName];
        }
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
        if (typeof chunk === "string" && typeof encoding === "string") {
            this.output.push(Buffer.from(chunk, encoding));
        } else if (chunk) {
            this.output.push(chunk);
        }
        if (callback) {
            throw new Error("not implemented: callback of write()");
        }
        return true;
    }

    end(chunk, encoding, callback) {
        if (typeof chunk === "string" && typeof encoding === "string") {
            this.output.push(Buffer.from(chunk, encoding));
        } else if (chunk) {
            this.output.push(chunk);
        }
        if (callback) {
            throw new Error("not implemented: callback of write()");
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
