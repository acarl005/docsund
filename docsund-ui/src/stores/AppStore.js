import { action, computed, observable } from 'mobx'

class AppStore {
  @observable modalVisibility = {
    email: false,
    personDetails: false,
  }
  @observable emailModalView = 'list'
  @observable activeEmailId = ''
  @observable activeRelationship
  @observable activePerson
  @observable explorerFullscreen = false
  @observable emailSearchTerm = ''
  @observable emailSearchResults = []

  @computed
  get activeEmail() {
    return this.activeRelationship.emails.find((email) => email.id === this.activeEmailId)
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
    this.emailSearchResults = response.hits.map(hit => hit.highlight)
  }

  @action setEmailModalView(view) {
    this.emailModalView = view
  }

  @action setActiveEmail(id) {
    this.activeEmailId = id
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
