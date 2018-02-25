const fetch = require("node-fetch");
const { createServer } = require("http");

module.exports = {
    initFetch() {
        return {
            fetch,
            createServer
        };
    }
};