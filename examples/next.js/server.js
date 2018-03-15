const next = require("next");
const { createServer } = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const { createShadowServer } = require("shadow-fetch");
const { shadowFetchMiddleware } = require("shadow-fetch-express");


const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
    const server = express();
    server.use(shadowFetchMiddleware);
    server.use(bodyParser.json());
    server.get("/api/message", (req, res) => {
        res.json({message: "hello via shadow-fetch"});
    });
    server.get("*", (req, res) => {
        return handle(req, res);
    });
    // enable shadow fetch entrypoint
    createShadowServer(server).listen();
    // enable standard HTTP entrypoint
    createServer(server).listen(3000, err => {
        if (err) throw err;
        console.log("> Ready on http://localhost:3000");
    });
});
