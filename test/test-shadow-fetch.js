const test = require("ava");
const { initFetch } = require("../index");
const fetch = require("../index");
const { printBenchmark } = require("./helper");

test("the simplest connection and receive regular output", async (t) => {
    const { fetch, createServer } = initFetch();

    const server = createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "hello" }));
    });

    server.listen(80);

    const start = process.hrtime();
    const res = await fetch("/test");
    const json = await res.json();
    const end = process.hrtime(start);

    t.is(res.status, 200);
    t.is(res.statusText, "OK");
    t.is(res.ok, true);
    t.is(json.message, "hello");

    t.log(printBenchmark("Benchmark shadow fetch and server with standard output", end));
});

test("the simplest connection and receive JSON output", async (t) => {
    const { fetch, createServer } = initFetch();

    const server = createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.writeJSON({ message: "hello" });
        res.end();
    });

    server.listen(80);

    const start = process.hrtime();
    const res = await fetch("/test");
    const json = await res.json();
    const end = process.hrtime(start);

    t.is(res.status, 200);
    t.is(res.statusText, "OK");
    t.is(res.ok, true);
    t.is(json.message, "hello");

    t.log(printBenchmark("Benchmark shadow fetch and server with JSON output", end));
});

test("write chunks and receive text", async (t) => {
    const { fetch, createServer } = initFetch();

    const server = createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write("hello\n");
        res.write("world\n");
        res.end();
    });

    server.listen(80);

    const res = await fetch("/test");
    t.is(res.status, 200);
    t.is(res.statusText, "OK");
    t.is(res.ok, true);

    const message = await res.text();
    t.is(message, "hello\nworld\n");
});

test("POST method and receive header", async (t) => {
    const { fetch, createServer } = initFetch();

    const server = createServer((req, res) => {
        t.is(req.method, "POST");
        res.writeHead(201, { "Location": "/test/2" });
        res.end();
    });

    server.listen(80);

    const res = await fetch("/test", { method: "POST" });
    t.is(res.status, 201);
    t.is(res.statusText, "Created");
    t.is(res.ok, true);
    t.is(res.headers.get("location"), "/test/2");
});

const redirectApp = (req, res) => {
    if (req.url === "/redirect") {
        res.writeHead(302, { "Location": "/landing-page" });
        res.end();
    } else if (req.url === "/landing-page") {
        res.end("landed");
    }
};

test("shadowFetch can follow redirection by default", async (t) => {
    const { fetch, createServer } = initFetch();

    const server = createServer(redirectApp);

    server.listen(80);

    const res = await fetch("/redirect");
    t.is(res.status, 200);
    t.is(res.redirected, true);
    const message = await res.text();
    t.is(message, "landed");
});

test("shadowFetch can detect uninitilzed status (1)", async (t) => {
    let message = null;
    try {
        await fetch("/test", { method: "POST" });
    } catch (e) {
        message = e.message;
    }
    t.is(typeof message, "string");
});

test("shadowFetch can detect uninitilzed status (2)", async (t) => {
    const { fetch } = initFetch();

    let message = null;
    try {
        await fetch("/test", { method: "POST" });
    } catch (e) {
        message = e.message;
    }
    t.is(typeof message, "string");
});
