import React, {Component} from "react";
import PropTypes from "prop-types";
import { fetch } from "../../../";
//import { fetch } from "shadow-fetch";

export default class Index extends Component {
    static async getInitialProps({req}) {
        console.log(fetch.toString());
        console.log("call /api/message");
        const res = await fetch("/api/message");
        console.log(res);
        const message = await res.json();
        console.log(message);
        return message;
    }

    render() {
        console.log(this.props);
        return <div>
            Message from shadow-fetch:
            ${this.props.message}
        </div>;
    }
}

Index.propTypes = {
    message: PropTypes.string
};
