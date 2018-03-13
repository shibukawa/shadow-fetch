const fetch = window.fetch || (window.fetch = require("unfetch").default || require("unfetch"));

const {
    initFetch,
    shadowFetch,
    createServer,
    Headers,
    IncomingMessage,
    ServerResponse
} = require("./index");

module.exports = {
    initFetch,
    fetch,
    shadowFetch,
    createServer,
    Headers,
    IncomingMessage,
    ServerResponse
};
