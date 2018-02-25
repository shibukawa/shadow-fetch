const { Headers, convertToServerHeaders } = require("./headers");

// HTTP methods whose capitalization should be normalized
var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return (methods.indexOf(upcased) > -1) ? upcased : method;
}

const bodyKey = Symbol("body");
const jsonKey = Symbol("json");
const formKey = Symbol("form");

class IncomingMessage {
    constructor(url, { method, headers, json, form, body } = {}) {
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
            this[bodyKey] = body;
            if (typeof body === "string") {
                contentType = "text/plain";
                contentLength = body.length;
            }
        }

        if (hasHeaders) {
            if (contentType) {
                headers.set("content-type", contentType);
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

        this._endListener = null;
        this._sendBody = false;
    }

    on(eventType, handler) {
        if (eventType === "data") {
            handler(this[bodyKey]);
            this._sendBody = true;
            if (this._endListener) {
                this._endListener();
                this._endListener = null;
            }
        } else if (eventType === "end") {
            if (this._sendBody) {
                handler();
            } else {
                this._endListener = handler;
            }
        }
    }

    pipe(dest) {
        dest.emit("pipe", this);
        this.on("end", () => {
            dest.end();
        });
        this.on("data", (data) => {
            dest.write(data);
        });
    }

    removeListener(event, handler) {
        if (event === "end" && handler === this._endListener) {
            this._endListener = null;
        }
    }
}

module.exports = {
    IncomingMessage,
    bodyKey,
    jsonKey,
    formKey
};
