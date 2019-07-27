import React from 'react'
import { observer } from 'mobx-react'
import { Icon, Layout, Tabs, Input, Spin } from 'antd'
import qs from "querystring"

import { fetchJSON, deepEquals, computeNodeScaleFactor, computeRelationshipScaleFactor } from "../utils"
import Card from './Card'
import appStore from "../stores/AppStore"
import TopicModelingComponent from "./TopicModelingComponent"
import Explorer from "./D3Visualization"
import { ExplorerContainer, LoadingWidgetContainer } from "./styled"

const { TabPane } = Tabs

@observer
export default class ExplorerSection extends React.Component {
  async componentDidMount() {
    return appStore.getCentralNodes()
  }

  async handleSearch(e) {
    e.preventDefault()
    const searchQuery = e.target.value.toLowerCase()
    await appStore.entitySearch(searchQuery)
  }

  async getUserNode(id) {
    const response = await fetchJSON(`${API_URL}/person/${id}`)
    computeNodeScaleFactor(response)
    return response
  }

  async getNeighbours(node, currentNeighbourIds = []) {
    const type = deepEquals(node.labels, ["Person"]) ? "person" : "entities"
    appStore.entitiesLoading = true
    let response
    try {
      response = await fetchJSON(`${API_URL}/${type}/${node.id}/graph-neighbours?limit=10`)
    } finally {
      appStore.entitiesLoading = false
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
    if (appStore.initialNodes.length > 0) {
      maybeExplorer = <Explorer
        key={appStore.entitySearchQuery}
        maxNeighbours={100}
        initialNodeDisplay={300}
        getNeighbours={this.getNeighbours.bind(this)}
        nodes={appStore.initialNodes}
        relationships={appStore.initialRelationships}
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
              placeholder="search entity names"
            />
            <ExplorerContainer fullscreen={appStore.explorerFullscreen}>
              { appStore.entitiesLoading ? 
                <LoadingWidgetContainer>
                  <Spin tip="loading..." size="large" />
                </LoadingWidgetContainer>
                : ""}
              { maybeExplorer }
            </ExplorerContainer>
          </TabPane>
          <TabPane tab="Topic Explorer" key="2">
            <TopicModelingComponent/>
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}

