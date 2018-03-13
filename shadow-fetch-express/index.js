const expressBodyParser = require("body-parser");
const { IncomingMessage, jsonKey, formKey, textKey, shadowKey } = require("../lib/incomingmessage");
const { ServerResponse } = require("../lib/serverresponse");

const shadowFetchMiddleware = (req, res, next) => {
    if (req[shadowKey]) {
        for (const key of Object.getOwnPropertyNames(IncomingMessage.prototype)) {
            if (key !== "constructor") {
                req[key] = IncomingMessage.prototype[key];
            }
        }
        for (const key of Object.getOwnPropertyNames(ServerResponse.prototype)) {
            if (key !== "constructor") {
                res[key] = ServerResponse.prototype[key];
            }
        }

        res.json = function (obj) {
            let val = obj;
            // allow status / body
            if (arguments.length === 2) {
                // res.json(body, status) backwards compat
                if (typeof arguments[1] === "number") {
                    this.statusCode = arguments[1];
                } else {
                    this.statusCode = arguments[0];
                    val = arguments[1];
                }
            }
            // content-type
            if (!this.get("Content-Type")) {
                this.set("Content-Type", "application/json");
            }
            this.writeJSON(val);
            return this.end();
        };
    }
    next();
};

const bodyParser = {
    json(opts) {
        const original = expressBodyParser.json(opts);
        return (req, res, next) => {
            const json = req[jsonKey];
            if (json) {
                req.body = json;
                req._body = true;
                next();
            } else {
                original(req, res, next);
            }
        };
    },
    text(opts) {
        const original = expressBodyParser.text(opts);
        return (req, res, next) => {
            const text = req[textKey];
            if (text) {
                req.body = text;
                req._body = true;
                next();
            } else {
                original(req, res, next);
            }
        };
    },
    raw(opts) {
        const original = expressBodyParser.text(opts);
        return (req, res, next) => {
            original(req, res, next);
        };
    },
    urlencoded(opts) {
        const original = expressBodyParser.urlencoded(opts);
        return (req, res, next) => {
            const form = req[formKey];
            if (form) {
                req.body = form;
                req._body = true;
                next(req, res);
            } else {
                original(req, res, next);
            }
        };
    }
};

module.exports = {
    bodyParser,
    shadowFetchMiddleware
};
