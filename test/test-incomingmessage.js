const test = require("ava");
var StreamTest = require("streamtest");
const { IncomingMessage, bodyKey, jsonKey, formKey, textKey } = require("../lib/incomingmessage");

process.on("uncaughtException", console.dir);

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

test("support reader stream interface", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        headers: {
            "content-type": "text/plain"
        },
        body: "hello world"
    });

    const called = [];

    req.on("end", () => {
        called.push("end");
    });

    req.on("data", (data) => {
        called.push("data");
        t.is(data.toString("utf8"), "hello world");
    });

    t.deepEqual(called, ["data", "end"]);
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
