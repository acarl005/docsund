import qs from "querystring"
import React, { Component } from "react"

import Explorer from "./D3Visualization"
import {
  StyledForm,
  StyledInput,
  AddonContainer,
  AddonLeft
} from "./styled"


function computeScaleFactor(node) {
  const messages = node.properties.incoming + node.properties.outgoing
  if (messages <= 1000) {
    node.scaleFactor = 1
  } else {
    node.scaleFactor = 1 + ((messages - 1000) / 1000) ** 0.3
  }
}


export default class Main extends Component {
  state = {
    searchQuery: "",
    initialNodes: []
  }

  async componentDidMount() {
    const response = await fetch(`http://localhost:5000/person/15`)
      .then(res => res.json())
    computeScaleFactor(response)
    this.setState({
      initialNodes: [response]
    })
  }

  async getNeighbours(id, currentNeighbourIds = []) {
    const response = await fetch(`http://localhost:5000/neighbours/${id}`)
      .then(res => res.json())
    const { neighbours, relationships } = response
    for (let neighbour of neighbours) {
      computeScaleFactor(neighbour)
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
    const url = "http://localhost:5000/internal_relationships?" + qs.stringify({
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
    const searchResults = await fetch("http://localhost:5000/search?" + qs.stringify({
      q: searchQuery
    }))
      .then(res => res.json())
    this.setState({
      initialNodes: searchResults,
      searchQuery
    })
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
      />
    }
    return (
      <div className="container">
        <StyledForm onSubmit={this.handleSearch.bind(this)}>
          <AddonContainer>
            <AddonLeft><i className="fas fa-search"></i></AddonLeft>
            <StyledInput name="searchInput" />
          </AddonContainer>
        </StyledForm>
        <div style={{ height: "600px" }}>
          { maybeExplorer }
        </div>
      </div>
    )
  }
}

