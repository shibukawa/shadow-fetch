const test = require("ava");
const { initFetch } = require("../index");

function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve.bind(null), t);
    });
}

const redirectApp = (req, res) => {
    res.end("ok");
};

test("createServer behaves like net/http createServer", async (t) => {
    const { createServer } = initFetch();

    const server = createServer(redirectApp);

    t.is(server.listening, false);
    let calledListnerCallback = false;
    server.listen(80, () => {
        calledListnerCallback = true;
    });
    t.is(server.listening, true);
    t.is(server.address().port, 80);

    await delay(50);
    t.is(calledListnerCallback, true);

    let calledCloseCallback = false;
    server.close(() => {
        calledCloseCallback = true;
    });

    await delay(50);
    t.is(calledCloseCallback, true);
});
