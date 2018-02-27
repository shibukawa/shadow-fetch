const { Headers } = require("./lib/headers");
const { ServerResponse } = require("./lib/serverresponse");
const { IncomingMessage } = require("./lib/incomingmessage");
const { Response } = require("./lib/response");


class Connection {
    constructor() {
        this._handler;
        this.fetch = this.fetch.bind(this);
    }

    async fetch(url, opts) {
        return new Promise((resolve) => {
            this._handler(new IncomingMessage(url, opts), new ServerResponse((res) => {
                resolve(new Response(res));
            }));
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


const { fetch, createServer } = initFetch();

module.exports = {
    initFetch,
    fetch,
    createServer,
    Headers,
    IncomingMessage,
    ServerResponse,
};
