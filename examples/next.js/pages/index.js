import React, {Component} from "react";
import PropTypes from "prop-types";
import { fetch } from "../../../";
//import { fetch } from "shadow-fetch";

export default class Index extends Component {
    static async getInitialProps({req}) {
        const res = await fetch("/api/message");
        const message = await res.json();
        return message;
    }

    render() {
        return <div>
            Message from shadow-fetch:
            {this.props.message}
        </div>;
    }
}

Index.propTypes = {
    message: PropTypes.string
};
