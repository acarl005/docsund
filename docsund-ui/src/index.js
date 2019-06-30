import React from "react"
import ReactDOM from "react-dom"

import Main from "./components/Main"

window.API_URL = process.env.API_URL === undefined ? "http://localhost:5000" : process.env.API_URL

ReactDOM.render(<Main />, document.getElementById("main"))
