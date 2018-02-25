const test = require("ava");
var StreamTest = require("streamtest");
const { IncomingMessage, bodyKey, jsonKey, formKey } = require("../lib/incomingmessage");

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
    t.is(req[bodyKey], "hello world");
    t.is(req.headers["content-type"], "text/plain");
    t.is(req.headers["content-length"], "11");
});

test("init with non-standard json property", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        json: {
            hello: "world"
        }
    });
    t.deepEqual(req[jsonKey], { hello: "world" });
    t.is(req.headers["content-type"], "application/json");
});

test("init with non-standard form property", (t) => {
    const req = new IncomingMessage("/test", {
        method: "post",
        form: {
            hello: "world"
        }
    });
    t.deepEqual(req[formKey], { hello: "world" });
    t.is(req.headers["content-type"], "application/x-www-form-urlencoded");
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
        t.is(data, "hello world");
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
