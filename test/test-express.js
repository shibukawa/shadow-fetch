const test = require("ava");
const express = require("express");
const bodyParser = require("body-parser");

const { initFetch } = require("../index");
const { shadowFetchMiddleware } = require("../shadow-fetch-express/index");

test("use express middleware", async (t) => {
    const app = express();
    app.use(shadowFetchMiddleware);
    app.use(bodyParser.json());
    app.post("/test", (req, res) => {
        t.is(req.shadow, true);
        t.is(req.body.message, "hello");
        res.send({ message: "world" });
    });
    const { fetch, createServer } = initFetch();

    createServer(app);
    const res = await fetch("/test", {
        method: "post",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({ message: "hello" })
    });
    t.is(res.status, 200);
    t.is(res.statusText, "OK");
    t.is(res.ok, true);
    const json = await res.json();
    t.is(json.message, "world");
});

test("use middleware and shadow fetch's json() method", async (t) => {
    const app = express();
    app.use(shadowFetchMiddleware);
    app.get("/test", (req, res) => {
        t.is(req.shadow, true);
        res.json({ message: "world" });
    });
    const { fetch, createServer } = initFetch();

    createServer(app);
    const res = await fetch("/test");
    t.is(res.status, 200);
    t.is(res.statusText, "OK");
    t.is(res.ok, true);
    const json = await res.json();
    t.is(json.message, "world");
});
