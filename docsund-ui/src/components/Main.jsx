import React, { Component } from "react"
import styled from "styled-components"
import { observer } from "mobx-react"
import { Layout } from "antd"
import Joyride, { ACTIONS, STATUS } from "react-joyride"
import appStore from "../stores/AppStore"
import RelationshipEmailsModal from "./modals/RelationshipEmailsModal"
import PersonDetailsModal from "./modals/PersonDetailsModal"
import EntityDetailsModal from "./modals/EntityDetailsModal"
import TopicSampleModal from "./modals/TopicSampleModal"
import EmailSearchResultModal from "./EmailSearch/EmailSearchResultModal"
import EmailSearch from "./EmailSearch"
import ExplorerSection from "./ExplorerSection"
import { TransparentButton } from "./styled"

let { Content } = Layout

Content = styled(Content)`
  @media screen and (min-width: 400px) {
    padding: 0 3%;
  }
  @media screen and (min-width: 700px) {
    padding: 0 6%;
  }
  @media screen and (min-width: 850px) {
    padding: 0 8%;
  }
  @media screen and (min-width: 1000px) {
    padding: 0 10%;
  }
  @media screen and (min-width: 1500px) {
    padding: 0 15%;
  }
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
      <strong>Single-click</strong>
      {" "}
or
      <strong>double-click</strong>
      {" "}
a node to see some cool stuff.
    </p>,
    target: ".node"
    // disableOverlayClose: true,
    // hideCloseButton: true,
    // hideFooter: true,
    // spotlightClicks: true,
  },
  {
    content: <p align="left">
      <strong>Double-click</strong>
      {" "}
an arrow to see emails between entities.
    </p>,
    target: ".relationship"
  }
  // {
  //  content: <p align="left">
  //    Close the list.
  //  </p>,
  //  placement: "bottom-start",
  //  target: ".ant-modal-close"
  // }
]

@observer
export default class Main extends Component {
  state = {
    joyride: false
  }

  joyrideEvent(e) {
    const { action, status } = e
    if (action === ACTIONS.RESET && status === STATUS.READY) {
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
          continuous
          run={this.state.joyride}
          scrollToFirstStep
          disableScrolling
          showProgress
          steps={joyrideSteps}
          styles={{ options: { primaryColor: "#1890FF" } }}
        />
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
