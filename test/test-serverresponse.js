const test = require("ava");
const StreamTest = require("streamtest");
const { ServerResponse } = require("../lib/serverresponse");
const { Response } = require("../lib/response");

test("stream compatibility test", async (t) => {
    for (const version of StreamTest.versions) {
        if (version === "v1") {
            // todo: fix
            continue;
        }
        const serverResponse = await new Promise(resolve => {
            const response = new ServerResponse(resolve);
            StreamTest[version].fromChunks(["a ", "chunk ", "and ", "another"])
                .pipe(response);
        });
        const response = new Response(serverResponse);
        const text = await response.text();
        t.is(text, "a chunk and another");
    }
});
