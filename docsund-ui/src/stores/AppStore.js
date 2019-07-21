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
  @observable loadingNodeDetails = false
  @observable loadingRelationshipEmails = false
  @observable loadingEmailSearch = false

  @computed
  get activeSearchEmail() {
    return this.emailSearchResults.hits.find((email) => email.id === this.activeSearchEmailId)
  }

  @action
  async getEmailsBetween(fromNode, toNode) {
    this.loadingRelationshipEmails = true
    this.activeRelationship = {
      toNode,
      fromNode,
    }
    const response = await fetchJSON(`${API_URL}/emails?between=${toNode.id},${fromNode.id}`)
    this.activeRelationship.emails = response
    this.loadingRelationshipEmails = false
  }

  @action
  async getEmailsAbout(person, entity) {
    this.loadingRelationshipEmails = true
    this.activeRelationship = {
      toNode: entity,
      fromNode: person,
    }
    const response = await fetchJSON(`${API_URL}/entities/${entity.id}/emails?person_id=${person.id}`)
    this.activeRelationship.emails = response
    this.loadingRelationshipEmails = false
  }

  @action
  async getEmailsMentioning(fromNode, toNode) {
    this.loadingRelationshipEmails = true
    this.activeRelationship = {
      toNode,
      fromNode,
    }
    const response = await fetchJSON(`${API_URL}/entities/${toNode.id}/emails?entity_id=${fromNode.id}`)
    this.activeRelationship.emails = response
    this.loadingRelationshipEmails = false
  }

  @action
  async getNodeDetails(node) {
    this.loadingNodeDetails = true
    this.activeNode = { node }
    const type = deepEquals(node.labels, ["Person"]) ? "person" : "entities"
    const response = await fetchJSON(`${API_URL}/${type}/${node.id}/graph-neighbours`)
    this.activeNode.details = response
    this.loadingNodeDetails = false
  }

  @action
  async submitEmailSearch(searchTerm, pageSize, pageNum = 1) {
    this.loadingEmailSearch = true
    this.searchQuery = null
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
    this.loadingEmailSearch = false
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
