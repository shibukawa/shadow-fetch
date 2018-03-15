const { IncomingMessage, shadowKey, ServerResponse } = require("shadow-fetch");

const shadowFetchMiddleware = (req, res, next) => {
    if (req[shadowKey]) {
        for (const key of Object.getOwnPropertyNames(IncomingMessage.prototype)) {
            if (key !== "constructor" || key !== "shadow") {
                req[key] = IncomingMessage.prototype[key];
            }
        }
        Object.defineProperty(req, "shadow", Object.getOwnPropertyDescriptor(IncomingMessage.prototype, "shadow"));
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

module.exports = {
    shadowFetchMiddleware
};
