const { Headers, convertToServerHeaders } = require("./headers");

// HTTP methods whose capitalization should be normalized
var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return (methods.indexOf(upcased) > -1) ? upcased : method;
}

const bodyKey = Symbol("body");
const textKey = Symbol("text");
const jsonKey = Symbol("json");
const formKey = Symbol("form");
const shadowKey = Symbol("shadow");

class IncomingMessage {
    constructor(url, { method, headers, json, form, body } = {}) {
        this[shadowKey] = true;
        if (!url) {
            return;
        }
        this.url = url;
        this.method = method ? normalizeMethod(method) : "GET";
        this.httpVersion = "1.1";
        const hasHeaders = !!headers;
        if (headers && !(headers instanceof Headers)) {
            headers = new Headers(headers);
        }

        let contentType;
        let contentLength = 0;

        if (json) {
            this[jsonKey] = json;
            contentType = "application/json";
        } else if (form) {
            this[formKey] = form;
            contentType = "application/x-www-form-urlencoded";
        } else if (body) {
            if (!Buffer.isBuffer(body)) {
                if (typeof body === "string") {
                    this[textKey] = body;
                    body = new Buffer(body, "utf8");
                } else {
                    body = new Buffer(body.toString(), "utf8");
                }
            }
            this[bodyKey] = body;
            contentType = "text/plain";
            contentLength = body.length;
        }

        if (hasHeaders) {
            if (contentType) {
                if (!headers.has("content-type")) {
                    headers.set("content-type", contentType);
                }
                headers.set("content-length", contentLength);
            }
            const serverHeader = convertToServerHeaders(headers);
            this.headers = serverHeader.headers;
            this.rawHeaders = serverHeader.rawHeaders;
        } else if (contentType) {
            this.headers = {
                "content-type": contentType,
                "content-length": contentLength
            };
            this.rawHeaders = [
                "content-type", contentType,
                "content-length", contentLength
            ];
        } else {
            this.headers = {};
            this.rawHeaders = [];
        }
        this.trailers = {};
        this.rawTrailers = [];

        this._sendBody = false;
        this._listeners = new Map();
    }

    get shadow() {
        return !!this[shadowKey];
    }

    on(eventType, handler) {
        const listneers = this._listeners.get(eventType);
        if (listneers) {
            listneers.push(handler);
        } else {
            this._listeners.set(eventType, [handler]);
        }
        if (eventType === "data") {
            handler(this[bodyKey]);
            this._sendBody = true;
            const listeners = this._listeners.get("end");
            if (listeners) {
                for (const listener of listeners) {
                    listener();
                }
            }
        } else if (eventType === "end") {
            if (this._sendBody) {
                handler();
            } else {
                this._endListener = handler;
            }
        }
    }

    listeners(eventName) {
        return this._listeners.get(eventName) || [];
    }

    resume() {
    }

    pipe(dest) {
        dest.emit("pipe", this);
        this.on("end", () => {
            dest.end();
        });
        this.on("data", (data) => {
            dest.write(data);
        });
        return dest;
    }

    removeListener(event, handler) {
        const listeners = this._listeners.get(event);
        listeners.splice(listeners.indexOf(handler), 1);
    }
}

module.exports = {
    IncomingMessage,
    bodyKey,
    jsonKey,
    formKey,
    textKey,
    shadowKey
};
