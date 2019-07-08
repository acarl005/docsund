import { action, computed, observable } from 'mobx'

class AppStore {
  @observable modalVisibility = {
    emailsBetween: false,
    topicSample: false,
    emailSearchResult: false,
    personDetails: false,
  }
  @observable emailModalView = 'list'
  @observable activeEmailId = ''
  @observable activeRelationship
  @observable activePerson
  @observable activeSearchEmailId = ''
  @observable explorerFullscreen = false
  @observable emailSearchTerm = ''
  @observable emailSearchResults = []
  @observable topicEmails = []

  @computed
  get activeSearchEmail() {
    return this.emailSearchResults.find((email) => email.id === this.activeSearchEmailId)
  }

  @action
  async getEmailsBetween(toUser, fromUser) {
    const response = await fetch(`${API_URL}/emails?between=${toUser.id},${fromUser.id}`)
      .then(res => res.json())
    this.activeRelationship = {
      toUser,
      fromUser,
      emails: response,
    }
  }

  @action
  async getPersonDetails(person) {
    const response = await fetch(`${API_URL}/neighbours/${person.id}`)
      .then(res => res.json())
    this.activePerson = {
      ...person,
      details: response
    }
  }

  @action
  async submitEmailSearch(searchTerm) {
    const response = await fetch(`${API_URL}/elasticsearch?q=${searchTerm}`)
      .then(res => res.json())
    this.emailSearchTerm = searchTerm
    this.emailSearchResults = response.hits.map(hit => ({
      id: hit._source.id,
      highlight: hit.highlight,
      properties: {
        date: hit._source.date,
        subject: hit._source.subject,
        body: hit._source.body,
        to: hit._source.to,
        from: hit._source.from,
      }
    }))
  }
  
  @action
  async fetchEmailsFromIDs(ids, sample) {
    const response = await fetch(`${API_URL}/emails?email_ids=${ids.slice(0, sample).join(",")}`)
      .then(res => res.json())
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
export default APP_STORE
