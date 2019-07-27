import React, { Component } from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import { Layout, Tabs, Menu, Button } from "antd"
const { Header, Content } = Layout

const navMenuPaths = [
  {
    path: "/",
    display: "Home",
    component: () => "kahn tent"
  },
  {
    path: "/enron",
    display: "Enron Emails",
    component: () => <iframe src="http://enron.docsund.info" frameborder="0" width="100%" height="100%"></iframe>
  },
  {
    path: "/sony",
    display: "Sony Emails",
    component: () => <iframe src="http://sony.docsund.info" frameborder="0" width="100%" height="100%"></iframe>
  },
  {
    path: "/clinton",
    display: "Clinton Emails",
    component: () => <iframe src="http://clinton.docsund.info" frameborder="0" width="100%" height="100%"></iframe>
  },
  {
    path: "/dnc",
    display: "DNC Emails",
    component: () => <iframe src="http://dnc.docsund.info" frameborder="0" width="100%" height="100%"></iframe>
  }
]

function Main() {
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
            selectedKeys={[navMenuPaths.findIndex(item => item.path === window.location.pathname)]}
            style={{ lineHeight: '64px', marginBottom: '64px' }}
            id="main-menu"
          >
            {navMenuPaths.map((item, i) => <Menu.Item key={i}><Link to={item.path}>{item.display}</Link></Menu.Item>)}
          </Menu>
        </Header>
        <Content>
          {navMenuPaths.map(item => <Route path={item.path} exact component={item.component} />)}
        </Content>
      </Layout>
    </Router>
  )
}

ReactDOM.render(<Main />, document.getElementById("main"))
