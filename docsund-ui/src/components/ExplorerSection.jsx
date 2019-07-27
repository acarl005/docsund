import React from 'react'
import { observer } from 'mobx-react'
import { Icon, Layout, Tabs, Input, Spin } from 'antd'
import qs from "querystring"

import { fetchJSON, deepEquals } from "../utils"
import Card from './Card'
import appStore from "../stores/AppStore"
import TopicModelingComponent from "./TopicModelingComponent"
import Explorer from "./D3Visualization"
import { ExplorerContainer, LoadingWidgetContainer } from "./styled"
import TopicExplorer from "./TopicExplorer"

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

@observer
export default class ExplorerSection extends React.Component {
  state = {
    searchQuery: "",
    initialNodes: [],
    initialRelationships: [],
    loading: false
  }

  async componentDidMount() {
    const { nodes, relationships } = await fetchJSON(`${API_URL}/nodes/central`)
    for (let node of nodes) {
      computeNodeScaleFactor(node)
    }
    for (let relationship of relationships) {
      computeRelationshipScaleFactor(relationship)
    }
    this.setState({
      initialNodes: nodes,
      initialRelationships: relationships
    })
  }

  async handleSearch(e) {
    e.preventDefault()
    const searchQuery = e.target.value.toLowerCase()
    this.setState({ loading: true })
    try {
      let searchResults = await fetchJSON(`${API_URL}/search?` + qs.stringify({
        q: searchQuery
      }))
      for (let node of searchResults) {
        computeNodeScaleFactor(node)
      }
      this.setState({
        initialNodes: searchResults,
        initialRelationships: [],
        searchQuery
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  async getUserNode(id) {
    const response = await fetchJSON(`${API_URL}/person/${id}`)
    computeNodeScaleFactor(response)
    return response
  }

  async getNeighbours(node, currentNeighbourIds = []) {
    const type = deepEquals(node.labels, ["Person"]) ? "person" : "entities"
    this.setState({ loading: true })
    let response
    try {
      response = await fetchJSON(`${API_URL}/${type}/${node.id}/graph-neighbours?limit=10`)
    } finally {
      this.setState({ loading: false })
    }
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
    appStore.toggleModal("relationshipEmails")
    const { source, target } = relationship
    if (relationship.type === "EMAILS_TO") {
      await appStore.getEmailsBetween(source, target)
    } else if (relationship.type === "DISCUSSED") {
      await appStore.getEmailsAbout(source, target)
    } else if (relationship.type === "APPEAR_WITH") {
      await appStore.getEmailsMentioning(source, target)
    } else {
      throw Error("Cannot handle relationship type ${relationship.type}")
    }
  }

  async onNodeDblClick(node) {
    if (deepEquals(node.labels, ["Person"])) {
      appStore.toggleModal('personDetails')
    } else {
      appStore.toggleModal('entityDetails')
    }
    await appStore.getNodeDetails(node)
  }

  setGraph(graph) {
    this.graph = graph
    this.autoCompleteRelationships([], this.graph._nodes)
  }

  render() {
    let maybeExplorer = null
    if (this.state.initialNodes.length > 0) {
      maybeExplorer = <Explorer
        key={this.state.searchQuery}
        maxNeighbours={100}
        initialNodeDisplay={300}
        getNeighbours={this.getNeighbours.bind(this)}
        nodes={this.state.initialNodes}
        relationships={this.state.initialRelationships}
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
    }

    return (
      <Card>
        <Tabs animated={false}>
          <TabPane tab="Entity Explorer" key="1">
            <Input
              prefix={<Icon type="search" />}
              style={{marginBottom: 8}}
              onPressEnter={this.handleSearch.bind(this)}
              id="entity-explorer-search"
            />
            <ExplorerContainer fullscreen={appStore.explorerFullscreen}>
              { this.state.loading ? 
                <LoadingWidgetContainer>
                  <Spin tip="loading..." size="large" />
                </LoadingWidgetContainer>
                : ""}
              { maybeExplorer }
            </ExplorerContainer>
          </TabPane>
          <TabPane tab="Topic Explorer" key="2">
            <TopicExplorer />
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}

