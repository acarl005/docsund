import React, { Component } from "react"
import styled from "styled-components"
import qs from "querystring"
import { observer } from "mobx-react"
import { Layout, Tabs, Menu, Icon, Button } from "antd"
import appStore from "../stores/AppStore"
import RelationshipEmailsModal from "./modals/RelationshipEmailsModal"
import PersonDetailsModal from "./modals/PersonDetailsModal"
import EntityDetailsModal from "./modals/EntityDetailsModal"
import TopicSampleModal from "./modals/TopicSampleModal"
import EmailSearchResultModal from "./EmailSearch/EmailSearchResultModal"
import EmailSearch from "./EmailSearch"
import ExplorerSection from "./ExplorerSection"
import Joyride, { ACTIONS, STATUS } from "react-joyride"
import { TransparentButton } from "./styled"

let { Header, Content } = Layout

Content = styled(Content)`
  padding: 0 12%;
  > * {
    margin: 24px;
  }
`

const joyrideSteps = [
  {
    content: <p align="left">
      You can enter a search query here (and press enter) to search for that word or phrase in all the emails.
    </p>,
    placement: "bottom-start",
    target: "#search-information",
    disableBeacon: true
  },
  {
    content: <p align="left">
      Click on one of these tabs to choose a tool to use.
    </p>,
    placement: "top",
    target: ".ant-tabs-nav"
  },
  {
    content: <p align="left">
      Enter a search term here (and press enter) to find a particular entity to show in the window below.
      For example to find the email address for John Doe, try searching for john.doe or johndoe.
    </p>,
    target: "#entity-explorer-search"
  },
  {
    content: <p align="left">
      <strong>Single-click</strong> or <strong>double-click</strong> a node to see some cool stuff.
    </p>,
    target: ".node",
    //disableOverlayClose: true,
    //hideCloseButton: true,
    //hideFooter: true,
    //spotlightClicks: true,
  },
  {
    content: <p align="left">
      <strong>Double-click</strong> an arrow to see emails between entities.
    </p>,
    target: ".relationship"
  },
  //{
  //  content: <p align="left">
  //    Close the list.
  //  </p>,
  //  placement: "bottom-start",
  //  target: ".ant-modal-close"
  //}
]

@observer
export default class Main extends Component {
  state = {
    joyride: false
  }

  joyrideEvent(e) {
    const { action, status } = e
    if (action === ACTIONS.RESET && status == STATUS.READY) {
      this.setState({ joyride: false })
    }
  }

  render() {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        {appStore.modalVisibility.emailSearchResult && <EmailSearchResultModal />}
        {appStore.modalVisibility.relationshipEmails && <RelationshipEmailsModal />}
        {appStore.modalVisibility.topicSample && <TopicSampleModal />}
        {appStore.modalVisibility.personDetails && <PersonDetailsModal />}
        {appStore.modalVisibility.entityDetails && <EntityDetailsModal />}
        <Joyride
          callback={this.joyrideEvent.bind(this)}
          continuous={true}
          run={this.state.joyride}
          scrollToFirstStep={true}
          disableScrolling={true}
          showProgress={true}
          steps={joyrideSteps}
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
            id="main-menu"
          >
            <Menu.Item key="1">Home</Menu.Item>
            <Menu.Item key="2">About</Menu.Item>
            <Menu.Item key="3">Enron Emails</Menu.Item>
            <Menu.Item key="4">Sony Emails</Menu.Item>
            <Menu.Item key="5" onClick={() => this.setState({ joyride: true })}>Walk-through</Menu.Item>
          </Menu>
        </Header>
        <Content>
          <div style={{ marginBottom: "-20px", textAlign: "right" }}>
            <TransparentButton icon="question-circle" onClick={() => this.setState({ joyride: true })}>Help</TransparentButton>
          </div>
          <EmailSearch />
          <ExplorerSection />
        </Content>
      </Layout>
    )
  }
}

