# shadow-fetch

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Gratipay][gratipay-image]][gratipay-url]

Accelorator of Server Side Rendering (and unit tests).

Next.js and Nuxt.js and some framework improves productivity of development.
You just write code once, the code run on the server and the client.
Almost all part or code is compatible including server access code.

Next.js's documents uses [isomorphic-unfetch](https://github.com/developit/unfetch/tree/master/packages/isomorphic-unfetch) and Nuxt.js's document uses [Axios](https://github.com/axios/axios).
They are both excellent isomorphic libraries, but they make actual packet even if the client and the server work on the same process for server side rendering.

This library provides ``fetch()`` compatible function and Node.js' ``http.createServer()`` compatible function.
They are connected directly and bypass system calls.

* You can make shorten SSR response a little
* The request object has special attribute to identify actual access or shortcut access. You can skip authentication of BFF's API during SSR safely.
* shadow-fetch provides special method to handle JSON. That method skip converting JSON into string.

![ScreenShot](https://raw.github.com/shibukawa/shadow-fetch/master/doc/shadow-fetch.png)

## Simple Benchmark

|    | time |
|:-----------:|:-----------|
| ``node-fetch`` and ``http.Server`` | 14.3 mS |
| ``shadow-fetch`` with standard API | 1.8 mS |
| ``shadow-fetch`` with direct JSON API | 0.13mS |

* 8th Gen Core i5 with Node 9.4.0.
* You can test via ``node run benchmark``.

## Installation

```sh
$ npm install shadow-fetch
```

## Usage

### Node.js's http server

### Express.js

Express.js modifies request object (replace prototype). shadow-fetch's middleware for Express.js enable shadow-fetch's feature even if you uses Express.js

## Client API

```js
const { fetch, Headers } = require("shadow-fetch");
```

It provides three functions that are almost compatible with standard [``fetch()``](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

* ``shadowFetch()``: Provides direct access between ``createServer``.
* ``fetch()``: Alias of ``shadowFetch()`` or standard ``fetch()``.

Usually ``fetch()`` is the only function you use.

|  Name  | on Node.js | on Browser |
|:-----------:|:-----------|:------------|
| ``fetch`` | ``shadowFetch`` | standard ``fetch`` |
| ``shadowFetch`` | ``shadowFetch`` | ``shadowFetch`` |

If you want to select actual HTTP access or not explicitly, use regular ``fetch()``.

This library provides ``Headers`` compatible class too.

## Server API

* ``createServer()``: It is a compatible function of Node.js's ``http.createServer()``.
* ``IncomingMessage``: Request object of server code. It is also compatible with Node.js's ``IncomingMessage`` except the following members:

    * ``shadow`` property: It always ``true``. You can identify the request is made by ``shadowFetch`` or regular HTTP access.
    *

* ``ServerResponse``: Response object of server code. It is also compatible with Node.js's ``ServerResponse`` except the following members:

    * ``writeJSON()``: It stores JSON without calling stringify function. You can get JSON directly via ``Response#json()`` method of ``shadowFetch()``.

```js
const { fetch, createServer } = require("shadow-fetch");
```

## Utility Function

* ``initFetch()``: It generates ``fetch()`` (shadow version) and ``createServer()`` they are connected internally. It is good for writing unit tests.


## License

MIT
