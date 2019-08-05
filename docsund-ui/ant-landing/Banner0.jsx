import React from "react"
import { Button, Icon } from "antd"
import TweenOne from "rc-tween-one"
import { withRouter } from "react-router-dom"

function Line(props) {
  return <div className="line" style={props.style} />
}

function Document(props) {
  const numLines = 5 + Math.floor(Math.random() * 4)
  const lines = Array(numLines).fill(null).map((_, i) => {
    const style = {
      width: `${60 + Math.random() * 40}%`
    }
    // eslint-disable-next-line react/no-array-index-key
    return <Line key={i} style={style} />
  })
  return (
    <div className="document" style={props.style}>
      { lines }
    </div>
  )
}

class Banner extends React.PureComponent {
  render() {
    const { ...currentProps } = this.props
    const { dataSource } = currentProps
    delete currentProps.dataSource
    delete currentProps.isMobile

    const documents = Array(40).fill(null).map((_, i) => {
      const style = {
        top: `${Math.random() * 100 - 12}%`,
        left: `${Math.random() * 100 - 12}%`,
        animationDelay: `${i * 0.1}s`
      }
      // eslint-disable-next-line react/no-array-index-key
      return <Document style={style} key={i} />
    })

    const RoutableButton = withRouter(({ history }) => (
      <Button ghost key="button" {...dataSource.button} onClick={e => dataSource.button.onClick(e, history)}>
        {dataSource.button.children}
      </Button>
    ))

    return (
      <div className="hero">
        {documents}
        <div {...currentProps} {...dataSource.wrapper} id="title">
          <div>
            <h1>Docsund</h1>
            <h3>
            An interactive application for journalists to explore large collections of
            emails to quickly find important stories.
            </h3>
            <RoutableButton />
          </div>
        </div>
        <div id="screen" />

        <TweenOne
          animation={{
            y: "-=20",
            yoyo: true,
            repeat: -1,
            duration: 1000
          }}
          className="hero-icon"
          onClick={() => {
            const elem = document.getElementsByClassName("content00-wrapper")[0]
            elem.scrollIntoView({ behavior: "smooth" })
          }}
          key="icon"
        >
          <Icon type="down" />
        </TweenOne>
      </div>
    )
  }
}
export default Banner
