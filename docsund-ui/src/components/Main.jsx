import React, { Component } from "react"
import styled from 'styled-components'
import qs from "querystring"
import { observer } from 'mobx-react'
import { Layout, Tabs, Menu, Icon } from 'antd'
import appStore from "../stores/AppStore"
import EmailsBetweenModal from "./EmailsBetweenModal"
import PersonDetailsModal from "./PersonDetailsModal"
import EmailSearchResultModal from "./EmailSearch/EmailSearchResultModal"
import EmailSearch from "./EmailSearch"
import ExplorerSection from './ExplorerSection'
const { Header } = Layout

const Content = styled.div`
  padding: 0 180px;

  > * {
    margin-top: 24px;
  }
`

@observer
export default class Main extends Component {
  render() {
    return (
      <Layout>
        {appStore.modalVisibility.emailSearchResult && <EmailSearchResultModal />}
        {appStore.modalVisibility.emailsBetween && <EmailsBetweenModal />}
        {appStore.modalVisibility.personDetails && <PersonDetailsModal />}
        <Header className="header">
          <div className="logo" style={{
              marginRight: "30px",
              float: "left",
              width: "40px"
            }}>
            <img src={ require("../../assets/logo.png") } style={{ width: "100%" }} />
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['3']}
            style={{ lineHeight: '64px', marginBottom: '64px' }}
          >
            <Menu.Item key="1">Home</Menu.Item>
            <Menu.Item key="2">About</Menu.Item>
            <Menu.Item key="3">Enron Emails</Menu.Item>
            <Menu.Item key="4">Sony Emails</Menu.Item>
          </Menu>
        </Header>
        <Content>
          <EmailSearch />
          <ExplorerSection />
        </Content>
      </Layout>
    )
  }
}

