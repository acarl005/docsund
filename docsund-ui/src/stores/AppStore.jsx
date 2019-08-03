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
  @observable topicSampleLoading = false
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
  getCentralNodes() {
    return this.tryLoading(async () => {
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
  entitySearch(searchQuery) {
    return this.tryLoading(async () => {
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
  getEmailsBetween(fromNode, toNode) {
    return this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/emails?between=${toNode.id},${fromNode.id}`)
      this.activeRelationship = {
        toNode,
        fromNode,
        emails: response
      }
    }, "loadingRelationshipEmails")
  }

  @action
  getEmailsAbout(person, entity) {
    return this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/entities/${entity.id}/emails?person_id=${person.id}`)
      this.activeRelationship = {
        toNode: entity,
        fromNode: person,
        emails: response
      }
    }, "loadingRelationshipEmails")
  }

  @action
  getEmailsMentioning(fromNode, toNode) {
    return this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/entities/${toNode.id}/emails?entity_id=${fromNode.id}`)
      this.activeRelationship = {
        toNode,
        fromNode,
        emails: response
      }
    }, "loadingRelationshipEmails")
  }

  @action
  getNodeDetails(node) {
    const type = node.labels[0] == "Person" ? "person" : "entities"
    this.activeNode = null
    return this.tryLoading(async () => {
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
  fetchEmailsFromIDs(ids, sample) {
    const sampledIds = ids.slice(0, sample)
    return this.tryLoading(async () => {
      const response = await fetchJSON(`${API_URL}/emails?email_ids=${sampledIds.join(",")}`)
      const emailOrderMap = {}
      for (let [i, id] of ids.entries()) {
        emailOrderMap[id] = i
      }
      const topicEmails = new Array(sampledIds.length)
      for (let email of response) {
        topicEmails[emailOrderMap[email.properties.emailId]] = email
      }
      this.topicEmails = topicEmails
    }, "topicSampleLoading")
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
