const test = require("ava");
const { initFetch } = require("./nodejs-implementation");

test("the actual connection and receive json", async (t) => {
    const { fetch, createServer } = initFetch();

    const server = createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "hello" }));
    });

    return new Promise((resolve) => {
        server.listen(async () => {
            const { port } = server.address();
            const start = Date.now();
            const res = await fetch(`http://localhost:${port}/test`);

            t.is(res.status, 200);
            t.is(res.statusText, "OK");
            t.is(res.ok, true);

            const json = await res.json();
            t.is(json.message, "hello");
            const end = Date.now();
            t.log(`Benchmark regular fetch and server: ${end - start}ms`);
            server.close(resolve);
        });
    });
});
/*
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
    t.is(res.headers.get("location", "/test/2"));
});*/