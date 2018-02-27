const test = require("ava");
const StreamTest = require("streamtest");
const { ServerResponse } = require("../lib/serverresponse");
const { Response } = require("../lib/response");

test("stream compatibility test v1", async (t) => {
    const serverResponse = await new Promise(resolve => {
        const response = new ServerResponse(resolve);
        StreamTest.v1.fromChunks(["a ", "chunk ", "and ", "another"])
            .pipe(response);
    });
    const response = new Response(serverResponse);
    const text = await response.text();
    t.is(text, "a chunk and another");
});

test("stream compatibility test v2", async (t) => {
    const serverResponse = await new Promise(resolve => {
        const response = new ServerResponse(resolve);
        StreamTest.v2.fromChunks(["a ", "chunk ", "and ", "another"])
            .pipe(response);
    });
    const response = new Response(serverResponse);
    const text = await response.text();
    t.is(text, "a chunk and another");
});
