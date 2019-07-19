import { action, computed, observable } from "mobx"
import qs from "querystring"
import { fetchJSON, deepEquals } from "../utils"

class AppStore {
  @observable modalVisibility = {
    relationshipEmails: false,
    topicSample: false,
    emailSearchResult: false,
    nodeDetails: false,
  }
  @observable emailModalView = 'list'
  @observable activeEmailId = null
  @observable activeRelationship
  @observable activeNode
  @observable activeSearchEmailId = null
  @observable explorerFullscreen = false
  @observable searchQuery
  @observable emailSearchResults = []
  @observable topicEmails = []

  @computed
  get activeSearchEmail() {
    return this.emailSearchResults.find((email) => email.id === this.activeSearchEmailId)
  }

  @action
  async getEmailsBetween(fromNode, toNode) {
    const response = await fetchJSON(`${API_URL}/emails?between=${toNode.id},${fromNode.id}`)
    this.activeRelationship = {
      toNode,
      fromNode,
      emails: response
    }
  }

  @action
  async getEmailsAbout(person, entity) {
    const response = await fetchJSON(`${API_URL}/entities/${entity.id}/emails?person_id=${person.id}`)
    this.activeRelationship = {
      toNode: entity,
      fromNode: person,
      emails: response
    }
  }

  @action
  async getEmailsMentioning(fromNode, toNode) {
    const response = await fetchJSON(`${API_URL}/entities/${toNode.id}/emails?entity_id=${fromNode.id}`)
    this.activeRelationship = {
      toNode,
      fromNode,
      emails: response
    }
  }

  @action
  async getNodeDetails(node) {
    const type = deepEquals(node.labels, ["Person"]) ? "person" : "entities"
    const response = await fetchJSON(`${API_URL}/${type}/${node.id}/graph-neighbours`)
    this.activeNode = {
      node,
      details: response
    }
  }

  @action
  async submitEmailSearch(searchTerm, pageSize, pageNum = 1) {
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
    this.searchQuery = searchTerm
  }
  
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
