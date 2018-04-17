const { Headers } = require("./lib/headers");
const { ServerResponse } = require("./lib/serverresponse");
const { IncomingMessage, shadowKey } = require("./lib/incomingmessage");
const { Response } = require("./lib/response");


class Connection {
    constructor() {
        this._handler = null;
        this.fetch = this.fetch.bind(this);
    }

    async fetch(url, opts) {
        return new Promise((resolve, reject) => {
            if (!this._handler) {
                return reject(new Error("shadow-fetch is not initialized properly. See https://github.com/shibukawa/shadow-fetch#trouble-shooting."))
            }
            let redirected = false;
            const receiveResponse = (res) => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    redirected = true;
                    this._handler(
                        new IncomingMessage(res._headers.get("location"), opts),
                        new ServerResponse(receiveResponse));
                } else {
                    const clientResponse = new Response(res);
                    clientResponse._redirected = redirected;
                    resolve(clientResponse);
                }
            };
            this._handler(new IncomingMessage(url, opts), new ServerResponse(receiveResponse));
        });
    }
}


class Server {
    constructor(connection, handler) {
        connection._handler = handler;
        this._address = {
            port: Math.floor(Math.random() * (65536 - 1024)) + 1024,
            address: "127.0.0.1",
            family: "IPv4",
            shadow: true
        };
        this._listening = false;
    }

    get listening() {
        return this._listening;
    }

    listen(...args) {
        if (typeof args[0] === "number") {
            this._address.port = args[0];
            args.splice(0, 1);
        }
        if (typeof args[0] === "function") {
            process.nextTick(args[0]);
        }
        this._listening = true;
    }

    address() {
        return this._address;
    }

    close(callback) {
        this._listening = false;
        if (callback) {
            process.nextTick(callback);
        }
    }
}

const initFetch = () => {
    const connection = new Connection();
    return {
        fetch(url, opts) {
            return connection.fetch(url, opts);
        },
        createServer(handler) {
            return new Server(connection, handler);
        }
    };
};

if (typeof window === "undefined") {
    if (!global.shadowFetch) {
        const { fetch, createServer } = initFetch();
        global.shadowFetch = fetch;
        global.createShadowServer = createServer;
    }
    module.exports = global.shadowFetch;
    module.exports.shadowFetch = module.exports.fetch = global.shadowFetch;
    module.exports.createShadowServer =  module.exports.createServer = global.createShadowServer;
}

module.exports.initFetch = initFetch;
module.exports.Headers = Headers;
module.exports.IncomingMessage = IncomingMessage;
module.exports.ServerResponse = ServerResponse;
module.exports.shadowKey = shadowKey;
