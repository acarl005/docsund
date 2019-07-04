import qs from "querystring"
import React, { Component } from "react"
import { observer } from 'mobx-react'
import { Layout, Tabs, Row, Col, Menu, Icon, Input, List } from 'antd'
import appStore from "../stores/AppStore"
import EmailModal from "./EmailModal"
import PersonDetailsModal from "./PersonDetailsModal"
import TopicModelingComponent from "./TopicModelingComponent"
const { Header, Content } = Layout
const { TabPane } = Tabs

import Explorer from "./D3Visualization"
import {
  StyledForm,
  StyledInput,
  AddonContainer,
  AddonLeft
} from "./styled"


function computeNodeScaleFactor(node) {
  const messages = node.properties.incoming + node.properties.outgoing
  if (messages <= 1000) {
    node.scaleFactor = 1
  } else {
    node.scaleFactor = 1 + ((messages - 1000) / 1000) ** 0.3
  }
}

function computeRelationshipScaleFactor(relationship) {
  relationship.scaleFactor = relationship.properties.count ** 0.4
}

const data = [
  'Search Result 1',
  'Search Result 2',
  'Search Result 3',
  'Search Result 4',
  'Search Result 5',
]

@observer
export default class Main extends Component {
  state = {
    searchQuery: "",
    initialNodes: [],
    modalEmailsBetween: null
  }

  async componentDidMount() {
    const userNode = await this.getUserNode(36290)
    this.setState({
      initialNodes: [userNode],
    })
  }

  async getUserNode(id) {
    const response = await fetch(`${API_URL}/person/${id}`)
      .then(res => res.json())
    computeNodeScaleFactor(response)
    return response
  }

  async getNeighbours(id, currentNeighbourIds = []) {
    const response = await fetch(`${API_URL}/neighbours/${id}?limit=10`)
      .then(res => res.json())
    const { neighbours, relationships } = response
    for (let neighbour of neighbours) {
      computeNodeScaleFactor(neighbour)
    }
    for (let relationship of relationships) {
      computeRelationshipScaleFactor(relationship)
    }

    this.autoCompleteRelationships(this.graph._nodes, neighbours)

    return {
      count: neighbours.length,
      nodes: neighbours,
      relationships
    }
  }

  async autoCompleteRelationships(existingNodes, newNodes) {
    const existingNodeIds = existingNodes.map(node => node.id)
    const newNodeIds = newNodes.map(node => node.id)
    const relationships = await this.getInternalRelationships(existingNodeIds, newNodeIds)
    this.autoCompleteCallback && this.autoCompleteCallback(relationships)
  }

  async getInternalRelationships(existingNodeIds, newNodeIds) {
    const url = `${API_URL}/internal_relationships?` + qs.stringify({
      existing_ids: existingNodeIds.join(","),
      new_ids: newNodeIds.join(",")
    })
    const response = await fetch(url)
      .then(res => res.json())
    return response
  }

  async handleSearch(e) {
    e.preventDefault()
    const searchQuery = e.target.elements.searchInput.value.toLowerCase()
    const searchResults = await fetch(`${API_URL}/search?` + qs.stringify({
      q: searchQuery
    }))
      .then(res => res.json())
    this.setState({
      initialNodes: searchResults,
      searchQuery
    })
  }

  async onRelDblClick(relationship) {
    const source = {
      id: relationship.source.id,
      email: relationship.source.propertyMap.email,
    }
    const target = {
      id: relationship.target.id,
      email: relationship.target.propertyMap.email,
    }
    await appStore.getEmailsBetween(source, target)
    appStore.toggleModal('email')
  }

  async onNodeDblClick(node) {
    const person = {
      id: node.id,
      email: node.propertyMap.email,
    }
    await appStore.getPersonDetails(person)
    appStore.toggleModal('personDetails')
  }

  setGraph (graph) {
    this.graph = graph
    this.autoCompleteRelationships([], this.graph._nodes)
  }

  render() {
    let maybeExplorer = <span />
    if (this.state.initialNodes.length > 0) {
      maybeExplorer = <Explorer
        key={this.state.searchQuery}
        maxNeighbours={100}
        initialNodeDisplay={300}
        getNeighbours={this.getNeighbours.bind(this)}
        nodes={this.state.initialNodes}
        relationships={[]}
        fullscreen={false}
        frameHeight={this.props.frameHeight}
        assignVisElement={this.props.assignVisElement}
        getAutoCompleteCallback={callback => {
          this.autoCompleteCallback = callback
        }}
        setGraph={this.setGraph.bind(this)}
        onRelDblClick={this.onRelDblClick.bind(this)}
        onNodeDblClick={this.onNodeDblClick.bind(this)}
      />
    }
    return (
      <Layout>
        {appStore.modalVisibility.email && <EmailModal />}
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
          <Row>
            <Col span={18} offset={3}>
              <div id="searchinput" style={{marginBottom: '16px', marginTop: '30px'}}>
                <Input addonAfter={<Icon type="search" />} placeholder="Type a search query against the emails..." />
              </div>
            </Col>
          </Row>

          <Row>
            <Col span={18} offset={3}>
              <div id="searchresults" style={{marginBottom: '64px'}}>
                <List
                  bordered
                  dataSource={data}
                  renderItem={item => (
                    <List.Item>
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col span={18} offset={3}>
              <div id="explorer">
                <Tabs style={{border: '1px solid grey', borderRadius: '10px'}} type="card">
                  <TabPane tab="Entity Explorer" key="1">
                    <StyledForm onSubmit={this.handleSearch.bind(this)}>
                      <AddonContainer>
                        <AddonLeft><i className="fas fa-search"></i></AddonLeft>
                        <StyledInput name="searchInput" />
                      </AddonContainer>
                    </StyledForm>
                    <div style={{ height: "600px" }}>
                      { maybeExplorer }
                    </div>
                  </TabPane>
                  <TabPane tab="Topic Explorer" key="2">
                    <TopicModelingComponent/>
                  </TabPane>
                  <TabPane tab="Money Explorer" key="3">
                    <img src={ require("../../assets/dollarsign.jpg") } alt=""/>
                  </TabPane>
                  <TabPane tab="Communication Explorer" key="4">
                    Hey.
                  </TabPane>
                </Tabs>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    )
  }
}

