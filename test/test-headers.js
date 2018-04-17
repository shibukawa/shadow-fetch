const test = require("ava");
const {
    Headers,
    convertToClientMode,
    convertToServerHeaders
} = require("../lib/headers");

test("empty headers", (t) => {
    const headers = new Headers();

    t.deepEqual(Array.from(headers.keys()), []);
    t.deepEqual(Array.from(headers.values()), []);
    t.deepEqual(Array.from(headers.entries()), []);

    t.is(headers.get("no-exist-key"), null);
    t.is(headers.has("no-exist-key"), false);
});

test("set/get", (t) => {
    const headers = new Headers();

    headers.set("accept-encoding", "gzip");

    t.is(headers.get("accept-encoding"), "gzip");
    t.is(headers.has("accept-encoding"), true);

    t.is(headers.get("Accept-Encoding"), "gzip");
    t.is(headers.has("Accept-Encoding"), true);

    headers.append("Content-Type", "application/json");

    t.is(headers.get("content-type"), "application/json");
    t.is(headers.has("content-type"), true);

    t.is(headers.get("Content-Type"), "application/json");
    t.is(headers.has("Content-Type"), true);

    t.deepEqual(Array.from(headers.keys()),
        ["accept-encoding", "content-type"]);
    t.deepEqual(Array.from(headers.values()),
        ["gzip", "application/json"]);
    t.deepEqual(Array.from(headers.entries()),
        [
            ["accept-encoding", "gzip"],
            ["content-type", "application/json"]
        ]);
});

test("set with not-string key", (t) => {
    const headers = new Headers();

    headers.set(1, "convert-to-number");
    t.is(headers.get("1"), "convert-to-number");
    t.is(headers.has("1"), true);
});

test("set with invalid key", (t) => {
    const headers = new Headers();

    let message = null;
    try {
        headers.set("不正なキー", "invalid key");
    } catch (e) {
        message = e.message;
    }
    t.is(message, "Invalid character in header field name");
});

test("delete", (t) => {
    const headers = new Headers();

    headers.set("accept-encoding", "gzip");
    headers.delete("Accept-Encoding");
    t.is(headers.get("accept-encoding"), null);
    t.is(headers.has("accept-encoding"), false);
});

test("init with object", (t) => {
    const headers = new Headers({
        "accept-encoding": "gzip",
        "content-type": "application/json"
    });
    t.is(headers.get("accept-encoding"), "gzip");
    t.is(headers.get("content-type"), "application/json");
});

test("init with array", (t) => {
    const headers = new Headers([
        ["accept-encoding", "gzip"],
        ["content-type", "application/json"]
    ]);
    t.is(headers.get("accept-encoding"), "gzip");
    t.is(headers.get("content-type"), "application/json");
});

test("init with Headers", (t) => {
    const originalHeaders = new Headers({
        "accept-encoding": "gzip",
        "content-type": "application/json"
    });
    const headers = new Headers(originalHeaders);
    t.is(headers.get("accept-encoding"), "gzip");
    t.is(headers.get("content-type"), "application/json");
});

test("forEach", (t) => {
    const headers = new Headers([
        ["accept-encoding", "gzip"],
        ["content-type", "application/json"]
    ]);

    const entries = [];
    headers.forEach((key, value) => {
        entries.push([key, value]);
    });

    t.deepEqual(entries,
        [
            ["gzip", "accept-encoding"],
            ["application/json", "content-type"]
        ]);
});

test("client mode", (t) => {
    const headers = new Headers();

    headers.set("accept-encoding", ["gzip", "br"]);
    headers.append("accept", ["application/json"]);
    headers.append("accept", ["text/html"]);

    t.is(headers.get("accept-encoding"), "gzip,br");
    // Chrome's Headers.append() inserts space after comma
    t.is(headers.get("accept"), "application/json, text/html");
});

test("compatible mode with nodejs's ServerResponse.setHeader()", (t) => {
    const headers = new Headers();
    headers._clientMode = false;

    // res.setHeader() keeps array as is
    headers.set("accept-encoding", ["gzip", "br"]);

    t.deepEqual(headers.get("accept-encoding"), ["gzip", "br"]);
});

test("convert to server headers", (t) => {
    const clientHeaders = new Headers();

    clientHeaders.set("accept-encoding", "gzip");
    clientHeaders.set("Content-Type", "application/json");

    const { headers, rawHeaders } = convertToServerHeaders(clientHeaders);

    t.deepEqual(headers,
        {
            "accept-encoding": "gzip",
            "content-type": "application/json"
        });
    t.deepEqual(rawHeaders,
        [
            "accept-encoding", "gzip",
            "content-type", "application/json"
        ]);
});

test("convert to client mode", (t) => {
    const headers = new Headers();
    headers._clientMode = false;

    headers.set("accept-encoding", ["gzip", "br"]);
    headers.set("Content-Type", "application/json");

    convertToClientMode(headers);

    t.is(headers.get("accept-encoding"), "gzip, br");
    t.is(headers.get("content-type"), "application/json");
});
