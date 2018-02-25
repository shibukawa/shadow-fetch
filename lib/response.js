const { statusTexts } = require("./statustexts");
const { bodyKey, jsonKey, formKey } = require("./incomingmessage");

class Response {
    constructor(serverResponse) {
        this._response = serverResponse;
    }

    get status() {
        return this._response.statusCode;
    }

    get ok() {
        return this._response.statusCode < 299;
    }

    get statusText() {
        if (this._response.statusMessage) {
            return this._response.statusMessage;
        } else {
            return statusTexts.get(this._response.statusCode);
        }
    }

    get headers() {
        return this._response._headers;
    }

    get redirected() {
        return false;
    }

    get type() {
        return "shadow";
    }

    get url() {
        return "/";
    }

    async arraybuffer() {
        throw new Error("not implemented");
    }

    async blob() {
        throw new Error("not implemented");
    }

    async json() {
        const json = this._response[jsonKey];
        if (json) {
            return json;
        }
        const text = await this.text();
        return JSON.parse(text);
    }

    async text() {
        const outputs = this._response.output;
        if (outputs.length === 0) {
            return "";
        } else if (outputs.length === 1) {
            if (typeof outputs[0] === "string") {
                return outputs[0];
            } else if (Buffer.isBuffer(outputs[0])) {
                return outputs[0].toString("utf8");
            } else {
                throw new Error("unsupported type: ", outputs[0]);
            }
        }
        let result = "";
        for (const output of outputs) {
            if (typeof output === "string") {
                result = result + output;
            } else if (Buffer.isBuffer(output)) {
                result = result + output.toString("utf8");
            } else {
                throw new Error("unsupported type: ", output);
            }
        }
        return result;
    }
}

module.exports = {
    Response
};
