const test = require("ava");
var StreamTest = require("streamtest");
const { IncomingMessage, bodyKey, textKey } = require("../lib/incomingmessage");

process.on("uncaughtException", console.dir);

test("init without url", (t) => {
    const req = new IncomingMessage();
    t.is(req.url, undefined);
});

test("init with url", (t) => {
    const req = new IncomingMessage("/test");
    t.is(req.url, "/test");
    t.is(req.method, "GET");
    t.is(req.httpVersion, "1.1");
    t.deepEqual(req.headers, {});
    t.deepEqual(req.rawHeaders, []);
    t.deepEqual(req.trailers, {});
    t.deepEqual(req.rawTrailers, []);
});

test("init with method/headers", (t) => {
    const req = new IncomingMessage("/test", {
        method: "put",
        headers: {
            "Accept": "application/json"
        }
    });
    t.is(req.url, "/test");
    t.is(req.method, "PUT");
    t.is(req.httpVersion, "1.1");
    t.deepEqual(req.headers, {
        "accept": "application/json"
    });
    t.deepEqual(req.rawHeaders, [
        "accept", "application/json"
    ]);
    t.deepEqual(req.trailers, {});
    t.deepEqual(req.rawTrailers, []);
});

test("init with body", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        headers: {
            "content-type": "text/plain"
        },
        body: "hello world"
    });
    t.is(req[bodyKey].toString("utf8"), "hello world");
    t.is(req[textKey].toString("utf8"), "hello world");
    t.is(req.headers["content-type"], "text/plain");
    t.is(req.headers["content-length"], "11");
});

test("init with body without headers (1)", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        body: "hello world"
    });
    t.is(req[bodyKey].toString("utf8"), "hello world");
    t.is(req[textKey].toString("utf8"), "hello world");
    t.is(req.headers["content-type"], "text/plain");
    t.is(req.headers["content-length"], "11");
});


test("init with body without headers (2)", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        body: 10
    });
    t.is(req[bodyKey].toString("utf8"), "10");
    t.is(req.headers["content-type"], "text/plain");
    t.is(req.headers["content-length"], "2");
});

test("init with body without headers (3)", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        headers: {
            "cookie": "session=12345"
        },
        body: 10
    });
    t.is(req[bodyKey].toString("utf8"), "10");
    t.is(req.headers["content-type"], "text/plain");
    t.is(req.headers["content-length"], "2");
});

test("support reader stream interface", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        headers: {
            "content-type": "text/plain"
        },
        body: "hello world"
    });

    const called = [];

    t.is(req.listeners("end").length, 0);
    t.is(req.listeners("data").length, 0);

    req.on("end", () => {
        called.push("end");
    });

    req.on("end", () => {
        called.push("end2");
    });

    req.on("data", (data) => {
        called.push("data");
        t.is(data.toString("utf8"), "hello world");
    });

    t.deepEqual(called, ["data", "end", "end2"]);
    t.is(req.listeners("end").length, 2);
    t.is(req.listeners("data").length, 1);
});

test("stream compatibility test", async (t) => {
    for (const version of StreamTest.versions) {
        const text = await new Promise((resolve, reject) => {
            try {
                const writer = StreamTest[version].toText((err, text) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(text);
                });
                const req = new IncomingMessage("/test", {
                    method: "post",
                    headers: {
                        "content-type": "text/plain"
                    },
                    body: "hello world"
                });
                req.pipe(writer);
            } catch (e) {
                reject(e);
            }
        });
        t.is(text, "hello world");
    }
});
