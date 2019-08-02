import React from "react"
import { action, computed, observable } from "mobx"
import qs from "querystring"
import { notification } from "antd"
import { fetchJSON, deepEquals, computeNodeScaleFactor, computeRelationshipScaleFactor } from "../utils"


function notifyError(err) {
  notification.error({
    message: "Error",
    description: <pre>{err.stack}</pre>
  })
}

class AppStore {
  @observable modalVisibility = {
    relationshipEmails: false,
    topicSample: false,
    emailSearchResult: false,
    nodeDetails: false,
  }
  @observable emailModalView = 'list'
  @observable activeEmailId
  @observable activeRelationship
  @observable activeNode
  @observable activeSearchEmailId
  @observable explorerFullscreen = false
  @observable emailSearchQuery
  @observable emailSearchResults = []
  @observable topicEmails = []
  @observable loadingNodeDetails = false
  @observable loadingRelationshipEmails = false
  @observable loadingEmailSearch = false
  @observable entitySearchQuery
  @observable entitiesLoading = false
  @observable initialNodes = []
  @observable initialRelationships = []

  @computed
  get activeSearchEmail() {
    return this.emailSearchResults.hits.find((email) => email.id === this.activeSearchEmailId)
  }

  async tryLoading(failureProneThing, loadingKey) {
    if (loadingKey) {
      this[loadingKey] = true
    }
    try {
      await failureProneThing()
    } catch (err) {
      console.error(err)
      notifyError(err)
    } finally {
      if (loadingKey) {
        this[loadingKey] = false
      }
    }
  }

  resetExplorer() {
    const entitySearchQuery = this.entitySearchQuery
    this.entitySearchQuery = ""
    setTimeout(() => {
      this.entitySearchQuery = entitySearchQuery
    }, 0)
  }

  @action
  async getCentralNodes() {
    this.tryLoading(async () => {
      const { nodes, relationships } = await fetchJSON(`${API_URL}/nodes/central`)
      for (let node of nodes) {
        computeNodeScaleFactor(node)
      }
      for (let relationship of relationships) {
        computeRelationshipScaleFactor(relationship)
      }
      this.initialRelationships = relationships
      this.initialNodes = nodes
    }, 'entitiesLoading')
  }

  @action
  async entitySearch(searchQuery) {
    this.tryLoading(async () => {
      let searchResults = await fetchJSON(`${API_URL}/search?` + qs.stringify({
        q: searchQuery
      }))
      for (let node of searchResults) {
        computeNodeScaleFactor(node)
      }
      this.initialRelationships = []
      this.initialNodes = searchResults
      this.entitySearchQuery = searchQuery
    }, "loadingEntitySearch")
  }

  @action
  async getEmailsBetween(fromNode, toNode) {
    this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/emails?between=${toNode.id},${fromNode.id}`)
      this.activeRelationship = {
        toNode,
        fromNode,
        emails: response
      }
    }, "loadingRelationshipEmails")
  }

  @action
  async getEmailsAbout(person, entity) {
    this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/entities/${entity.id}/emails?person_id=${person.id}`)
      this.activeRelationship = {
        toNode: entity,
        fromNode: person,
        emails: response
      }
    }, "loadingRelationshipEmails")
  }

  @action
  async getEmailsMentioning(fromNode, toNode) {
    this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/entities/${toNode.id}/emails?entity_id=${fromNode.id}`)
      this.activeRelationship = {
        toNode,
        fromNode,
        emails: response
      }
    }, "loadingRelationshipEmails")
  }

  @action
  async getNodeDetails(node) {
    const type = node.labels[0] == "Person" ? "person" : "entities"
    this.activeNode = null
    this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/${type}/${node.id}/graph-neighbours`)
      this.activeNode = {
        node,
        details: response
      }
    }, "loadingNodeDetails")
  }

  @action exploreEmail(email) {
    // scroll to the bottom of the page (to put the explorer into view)
    window.scrollTo(0, document.body.scrollHeight)
    return this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/emails/${email.id}/entities`)
      this.initialRelationships = []
      this.initialNodes = response
      this.entitySearchQuery = `explore-${email.id}`
    }, "entitiesLoading")
  }

  @action
  async submitEmailSearch(searchTerm, pageSize, pageNum = 1) {
    this.emailSearchQuery = null
    this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/elasticsearch?` + qs.stringify({
        q: searchTerm,
        page_num: pageNum,
        page_size: pageSize
      }))
      this.emailSearchResults = {
        ...response,
        hits: response.hits.map(hit => ({
          id: hit._source.id,
          highlight: hit.highlight,
          properties: {
            to: hit._source.to,
            from: hit._source.from,
            subject: hit._source.subject,
            body: hit._source.body,
            date: hit._source.date
          }
        }))
      }
      this.emailSearchQuery = searchTerm
    }, "loadingEmailSearch")
  }

  // TODO hook this up!
  @action
  async fetchEmailsFromIDs(ids, sample) {
    const response = await fetchJSON(`${API_URL}/emails?email_ids=${ids.slice(0, sample).join(",")}`)
    this.topicEmails = response
  }

  @action setEmailModalView(view) {
    this.emailModalView = view
  }

  @action setActiveEmail(email) {
    this.activeEmail = email
  }

  @action setActiveSearchEmail(id) {
    this.activeSearchEmailId = id
  }

  @action toggleModal(modalName) {
    this.modalVisibility[modalName] = !this.modalVisibility[modalName]
  }

  @action toggleExplorerFullscreen() {
    this.explorerFullscreen = !this.explorerFullscreen
  }
}

const APP_STORE = new AppStore()
window.appStore = APP_STORE
window.proxyDebug = obj => JSON.parse(JSON.stringify(obj))
export default APP_STORE
