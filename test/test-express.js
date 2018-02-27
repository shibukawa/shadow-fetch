const test = require("ava");
const express = require("express");
const expressBodyParser = require("body-parser");

const { initFetch } = require("../index");
const { shadowFetch, bodyParser } = require("../shadow-fetch-express/index");

test("use express middleware", async (t) => {
    const app = express();
    app.use(shadowFetch);
    app.use(expressBodyParser.json());
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

test("use middleware and shadow fetch body parser", async (t) => {
    const app = express();
    app.use(shadowFetch);
    app.use(bodyParser.json());
    app.post("/test", (req, res) => {
        t.is(req.shadow, true);
        res.writeJSON({ message: "world" });
        res.end();
    });
    const { fetch, createServer } = initFetch();

    createServer(app);
    const res = await fetch("/test", {
        method: "post",
        json: { message: "hello" }
    });
    t.is(res.status, 200);
    t.is(res.statusText, "OK");
    t.is(res.ok, true);
    const json = await res.json();
    t.is(json.message, "world");
});
