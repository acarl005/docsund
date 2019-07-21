import React, { Component } from "react"
import styled from 'styled-components'
import qs from "querystring"
import { observer } from 'mobx-react'
import { Layout, Tabs, Menu, Icon } from 'antd'
import appStore from "../stores/AppStore"
import RelationshipEmailsModal from "./modals/RelationshipEmailsModal"
import PersonDetailsModal from "./modals/PersonDetailsModal"
import EntityDetailsModal from "./modals/EntityDetailsModal"
import TopicSampleModal from "./modals/TopicSampleModal"
import EmailSearchResultModal from "./EmailSearch/EmailSearchResultModal"
import EmailSearch from "./EmailSearch"
import ExplorerSection from './ExplorerSection'
let { Header, Content } = Layout

Content = styled(Content)`
  padding: 0 12%;
  > * {
    margin: 24px;
  }
`

@observer
export default class Main extends Component {
  render() {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        {appStore.modalVisibility.emailSearchResult && <EmailSearchResultModal />}
        {appStore.modalVisibility.relationshipEmails && <RelationshipEmailsModal />}
        {appStore.modalVisibility.topicSample && <TopicSampleModal />}
        {appStore.modalVisibility.personDetails && <PersonDetailsModal />}
        {appStore.modalVisibility.entityDetails && <EntityDetailsModal />}
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

