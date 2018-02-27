const expressBodyParser = require("body-parser");
const { IncomingMessage, jsonKey, formKey, textKey } = require("../lib/incomingmessage");
const { ServerResponse } = require("../lib/serverresponse");

const shadowFetch = (req, res, next) => {
    Object.setPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(req)), new IncomingMessage);
    Object.setPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(res)), new ServerResponse);
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
    shadowFetch
};
