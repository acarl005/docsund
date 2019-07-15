import React from 'react'
import { observer } from 'mobx-react'
import { Icon, Layout, Tabs, Input } from 'antd'
import qs from "querystring"

import { fetchJSON, deepEquals } from "../utils"
import Card from './Card'
import appStore from "../stores/AppStore"
import TopicModelingComponent from "./TopicModelingComponent"
import Explorer from "./D3Visualization"

const { TabPane } = Tabs

function computeNodeScaleFactor(node) {
  if (deepEquals(node.labels, ["Person"])) {
    const messages = node.properties.incoming + node.properties.outgoing
    if (messages <= 500) {
      node.scaleFactor = 1
    } else {
      node.scaleFactor = Math.min(1 + Math.log(messages / 500) / Math.log(7), 2.5)
    }
  }
}

function computeRelationshipScaleFactor(relationship) {
  if (relationship.type == "EMAILS_TO") {
    relationship.scaleFactor = relationship.properties.count ** 0.4
  }
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

  async componentDidMount() {
    const userNode = await this.getUserNode(2275)
    computeNodeScaleFactor(userNode)
    this.setState({
      initialNodes: [userNode],
    })
  }

  async handleSearch(e) {
    e.preventDefault()
    const searchQuery = e.target.value.toLowerCase()
    const searchResults = await fetchJSON(`${API_URL}/search?` + qs.stringify({
      q: searchQuery
    }))
    for (let node of searchResults) {
      computeNodeScaleFactor(node)
    }
    this.setState({
      initialNodes: searchResults,
      searchQuery
    })
  }

  async getUserNode(id) {
    const response = await fetchJSON(`${API_URL}/person/${id}`)
    computeNodeScaleFactor(response)
    return response
  }

  async getNeighbours(node, currentNeighbourIds = []) {
    const type = deepEquals(node.labels, ["Person"]) ? "Person" : "Entity"
    const response = await fetchJSON(`${API_URL}/${type}/${node.id}/graph-neighbours?limit=10`)
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
    return fetchJSON(url)
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
    await appStore.getNodeDetails(node)
    appStore.toggleModal('nodeDetails')
  }

  setGraph(graph) {
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
        theme={{ secondaryBackground: "rgba(255, 255, 255, 0.5)" }}
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

