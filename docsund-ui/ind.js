import React from "react"
import ReactDOM from "react-dom"

function Line(props) {
  return <div className="line" style={props.style}></div>
}

function Document(props) {
  const numLines = 5 + Math.floor(Math.random() * 5)
  const lines = Array(numLines).fill(null).map((_, i) => {
    const style = {
      width: `${60 + Math.random() * 40}%`
    }
    return <Line key={i} style={style} />
  })
  return <div className="document" style={props.style}>
    { lines }
  </div>
}

function Main() {
  const documents = Array(40).fill(null).map((_, i) =>{
    const style = {
      top: `${Math.random() * 100 - 12}%`,
      left: `${Math.random() * 100 - 12}%`,
      animationDelay: `${i * 0.1}s`
    }
    return <Document style={style} key={i} />
  })
  return <>
    { documents }
    <div id="title">
      <div>
        <h1>Docsund</h1>
        <h3>
          An interactive application for journalists to explore large collections of
          emails to quickly find important stories.
        </h3>
      </div>
    </div>
    <div id="screen"></div>
  </>
}
ReactDOM.render(<Main />, document.getElementById("main"))

