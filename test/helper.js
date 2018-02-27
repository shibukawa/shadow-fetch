const fetch = require("node-fetch");
const { createServer } = require("http");

module.exports = {
    initStandardFetch() {
        return {
            fetch,
            createServer
        };
    },
    printBenchmark(message, [sec, nanosec]) {
        let microsec = Math.round(nanosec / 1000).toString(10);
        for (let i = microsec.length; i < 6; i++) {
            microsec = "0" + microsec;
        }
        return `${message}: ${sec}.${microsec} seconds`;
    }
};
