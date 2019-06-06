import qs from "querystring"
import React, { Component } from "react"

import Explorer from "./D3Visualization"
import {
  StyledForm,
  StyledInput,
  AddonContainer,
  AddonLeft
} from "./styled"
import * as testGraph from "../../test-data"


export default class Main extends Component {
  state = {
    searchQuery: "",
    initialNodes: [
      {
        id: 4,
        labels: [ "Person" ],
        properties: {
          email: "james.steffes@enron.com"
        }
      }
    ]
  }

  async getNeighbours(id, currentNeighbourIds = []) {
    const response = await fetch(`http://localhost:5000/neighbours/${id}`)
      .then(res => res.json())
    const { neighbours, relationships } = response

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
    // this is a hack for when this function is called by this.getNeighbours
    // the new neighbours need to get added before we call the autoCompleteCallback
    // but that won't happen until this.getNeighbours returns...
    // throw this on the event queue after 100ms to be done after this stack finishes
    await new Promise(resolve => setTimeout(resolve, 100))
    this.autoCompleteCallback && this.autoCompleteCallback(relationships)
  }

  async getInternalRelationships(existingNodeIds, newNodeIds) {
    {
      existingNodeIds = existingNodeIds.concat(newNodeIds)
      console.log(testGraph.getInternalRelationships(existingNodeIds, newNodeIds))
    }
    const url = "http://localhost:5000/internal_relationships?" + qs.stringify({
      existing_ids: existingNodeIds.join(","),
      new_ids: newNodeIds.join(",")
    })
    const response = await fetch(url)
      .then(res => res.json())
    console.log(response)
  }

  handleSearch(e) {
    e.preventDefault()
    const searchQuery = e.target.elements.searchInput.value.toLowerCase()
    const searchTerms = searchQuery.split(/\s+/)
    const searchResults = testGraph.search(searchTerms)
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
    console.log(this.state)
    return (
      <div className="container">
        <StyledForm onSubmit={this.handleSearch.bind(this)}>
          <AddonContainer>
            <AddonLeft><i className="fas fa-search"></i></AddonLeft>
            <StyledInput name="searchInput" />
          </AddonContainer>
        </StyledForm>
        <div style={{ height: "600px" }}>
          <Explorer
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
        </div>
      </div>
    )
  }
}

