/* eslint no-undef: 0 */
/* eslint arrow-parens: 0 */
import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { enquireScreen } from "enquire-js"

import Nav0 from "./Nav0"
import Banner0 from "./Banner0"
import Content0 from "./Content0"
import Content3 from "./Content3"
import Footer1 from "./Footer1"

import {
  Nav00DataSource,
  Banner01DataSource,
  Content00DataSource,
  Content01DataSource,
  Content02DataSource,
  DemosDataSource,
  Content03DataSource,
  Footer10DataSource
} from "./data.source"
import "./less/antMotionStyle.less"

let isMobile
enquireScreen((b) => {
  isMobile = b
})

const { location } = window


export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isMobile,
      show: !location.port
    }
  }

  componentDidMount() {
    enquireScreen((b) => {
      this.setState({ isMobile: !!b })
    })
    if (location.port) {
      setTimeout(() => {
        this.setState({
          show: true
        })
      }, 500)
    }
  }

  render() {
    const navHomePath = {
      path: "/",
      display: "Home",
      component: () => (
        <>
          <Banner0
            id="Banner0_1"
            key="Banner0_1"
            dataSource={Banner01DataSource}
            isMobile={this.state.isMobile}
          />
          <Content0
            id="Content0_0"
            key="Content0_0"
            dataSource={Content00DataSource}
            isMobile={this.state.isMobile}
          />
          <Content0
            id="Content0_1"
            key="Content0_1"
            dataSource={Content01DataSource}
            isMobile={this.state.isMobile}
          />
          <Content0
            id="Content0_2"
            key="Content0_2"
            dataSource={Content02DataSource}
            isMobile={this.state.isMobile}
          />
          <Content0
            id="demos"
            key="demos"
            dataSource={DemosDataSource}
            isMobile={this.state.isMobile}
          />
          <Content3
            id="Content3_0"
            key="Content3_0"
            dataSource={Content03DataSource}
            isMobile={this.state.isMobile}
          />
          <Footer1
            id="Footer1_0"
            key="Footer1_0"
            dataSource={Footer10DataSource}
            isMobile={this.state.isMobile}
          />
        </>
      )
    }

    const navMenuPaths = [navHomePath, ...Nav00DataSource.Menu.children]
    const children = [
      <Nav0
        id="Nav0_0"
        key="Nav0_0"
        dataSource={Nav00DataSource}
        isMobile={this.state.isMobile}
      />,
      ...navMenuPaths.map(item => <Route path={item.path} exact component={item.component} key={item.path} />)
    ]
    return (
      <Router>
        <div
          className="templates-wrapper"
          ref={(d) => {
            this.dom = d
          }}
        >
          {this.state.show && children}
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<Home />, document.getElementById("main"))
