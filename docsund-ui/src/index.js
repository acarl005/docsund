/* eslint-disable react/jsx-filename-extension */
import React from "react"
import ReactDOM from "react-dom"

import Main from "./components/Main"

window.API_URL = process.env.API_URL === undefined ? "http://localhost:5000" : process.env.API_URL
window.TOPIC_API_URL = process.env.TOPIC_API_URL === undefined ? "http://localhost:5001" : process.env.TOPIC_API_URL

ReactDOM.render(<Main />, document.getElementById("main"))
