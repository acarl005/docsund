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
import Joyride from 'react-joyride'

let { Header, Content } = Layout

Content = styled(Content)`
  padding: 0 12%;
  > * {
    margin: 24px;
  }
`

@observer
export default class Main extends Component {

  constructor(props) {
      super(props);

      this.state = {
          run: false,
          steps: [
              {
                  content: <p align="left">First choose an email dump to use.</p>,
                  placement: 'bottom-start',
                  target: '.main-menu',
                  disableBeacon: true
              },
              {
                  content: <p align="left">You can enter a search query here (and press enter) to search for that word or phrase in all the emails. Note that you can use Boolean operators such as AND and OR in the search expression.</p>,
                  placement: 'bottom-start',
                  target: '.search-information',
              },
              {
                  content: <p align="left">Click on one of these tabs to choose a tool to use.</p>,
                  placement: 'top',
                  target: '.explorer-information'
              },
              {
                  content: <p align="left">Enter a search term here (and press enter) to find a particular entity to show in the window below. For example to find the email address for John Doe, try searching for john.doe or johndoe.</p>,
                  placement: 'bottom-start',
                  target: '.entity-explorer-search'
              }
          ]
      };
  }

  render() {
    const {run, steps} = this.state;

    return (
      <Layout style={{ minHeight: "100vh" }}>
        {appStore.modalVisibility.emailSearchResult && <EmailSearchResultModal />}
        {appStore.modalVisibility.relationshipEmails && <RelationshipEmailsModal />}
        {appStore.modalVisibility.topicSample && <TopicSampleModal />}
        {appStore.modalVisibility.personDetails && <PersonDetailsModal />}
        {appStore.modalVisibility.entityDetails && <EntityDetailsModal />}
        <Joyride
          continuous={true}
          run={run}
          scrollToFirstStep={true}
          showProgress={true}
          steps={steps}
        />
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
            className="main-menu"
          >
            <Menu.Item key="1">Home</Menu.Item>
            <Menu.Item key="2">About</Menu.Item>
            <Menu.Item key="3">Enron Emails</Menu.Item>
            <Menu.Item key="4">Sony Emails</Menu.Item>
            <Menu.Item key="5" onClick={() => this.setState({run: true})}>Walk-through</Menu.Item>
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

