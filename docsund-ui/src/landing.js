import React, { Component, useState } from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import { Layout, Tabs, Menu, Button } from "antd"
const { Header, Content } = Layout

const navMenuPaths = [
  {
    path: "/",
    display: "Home",
    component: () => <div>
      fuck,
    </div>
  },
  {
    path: "/enron",
    display: "Enron Emails",
    component: () => <iframe src="http://enron.docsund.info" frameBorder="0" width="100%" height="100%"></iframe>
  },
  {
    path: "/sony",
    display: "Sony Emails",
    component: () => <iframe src="http://sony.docsund.info" frameBorder="0" width="100%" height="100%"></iframe>
  },
  {
    path: "/clinton",
    display: "Clinton Emails",
    component: () => <iframe src="http://clinton.docsund.info" frameBorder="0" width="100%" height="100%"></iframe>
  },
  {
    path: "/dnc",
    display: "DNC Emails",
    component: () => <iframe src="http://dnc.docsund.info" frameBorder="0" width="100%" height="100%"></iframe>
  }
]

function Main() {
  const [active, setActive] = useState("0")
  return (
    <Router>
      <Layout>
        <Header style={{ boxShadow: "0 4px 4px" }}>
          <div className="logo" style={{
            marginRight: "30px",
            float: "left",
            width: "40px"
          }}>
            <img src={ require("../assets/logo.png") } style={{ width: "100%" }} />
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[active]}
            style={{ lineHeight: '64px', marginBottom: '64px' }}
            id="main-menu"
          >
            {navMenuPaths.map((item, i) => <Menu.Item key={i}>
              <Link to={item.path} onClick={() => setActive(i.toString())} key={i}>{item.display}</Link>
            </Menu.Item>)}
          </Menu>
        </Header>
        <Content>
          {navMenuPaths.map(item => <Route path={item.path} exact component={item.component} key={item.path} />)}
        </Content>
      </Layout>
    </Router>
  )
}

ReactDOM.render(<Main />, document.getElementById("main"))
