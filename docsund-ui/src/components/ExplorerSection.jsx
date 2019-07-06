import React from 'react'
import { observer } from 'mobx-react'
import { Icon, Layout, Tabs, Input } from 'antd'
import qs from "querystring"
import Card from './Card'
import appStore from "../stores/AppStore"
import TopicModelingComponent from "./TopicModelingComponent"
import Explorer from "./D3Visualization"

const { TabPane } = Tabs

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

const fullscreenStyle = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  position: 'fixed',
}

@observer
export default class ExplorerSection extends React.Component {
  state = {
    searchQuery: "",
    initialNodes: [],
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
    appStore.toggleModal('emailsBetween')
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
    const maybeExplorer = this.state.initialNodes.length > 0 ? (
      <Explorer
        key={this.state.searchQuery}
        maxNeighbours={100}
        initialNodeDisplay={300}
        getNeighbours={this.getNeighbours.bind(this)}
        nodes={this.state.initialNodes}
        relationships={[]}
        fullscreen={appStore.explorerFullscreen}
        frameHeight={this.props.frameHeight}
        assignVisElement={this.props.assignVisElement}
        getAutoCompleteCallback={callback => {
          this.autoCompleteCallback = callback
        }}
        setGraph={this.setGraph.bind(this)}
        onRelDblClick={this.onRelDblClick.bind(this)}
        onNodeDblClick={this.onNodeDblClick.bind(this)}
      />
    ) : <span />

    return (
      <Card>
        <Tabs animated={false}>
          <TabPane tab="Entity Explorer" key="1">
            <Input
              prefix={<Icon type="search" />}
              style={{marginBottom: 8}}
              onPressEnter={this.handleSearch.bind(this)}
            />
            <div style={appStore.explorerFullscreen ? fullscreenStyle : { height: "600px" }}>
              { maybeExplorer }
            </div>
          </TabPane>
          <TabPane tab="Topic Explorer" key="2">
            <TopicModelingComponent/>
          </TabPane>
          <TabPane tab="Money Explorer" key="3">
            <img src={ require("../../assets/dollarsign.jpg") } alt=""/>
          </TabPane>
          <TabPane disabled tab="Communication Explorer" key="4">
            Hey.
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}

