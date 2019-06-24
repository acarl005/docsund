import { action, computed, observable } from 'mobx'

class AppStore {
  @observable modalVisibility = {
    email: false,
    personDetails: false,
  }
  @observable emailModalView = 'list'
  @observable activeEmailId = ''
  @observable emails = []
  @observable activePerson

  @computed
  get activeEmail() {
    return this.emails.find((email) => email.id === this.activeEmailId)
  }

  @action
  async getEmailsBetween(toUserId, fromUserId) {
    const response = await fetch(`http://10.0.0.21:5000/emails?between=${toUserId},${fromUserId}`)
      .then(res => res.json())
    this.emails = response
  }

  @action
  async getPersonDetails(id) {
    const response = await fetch(`http://10.0.0.21:5000/neighbours/${id}`)
      .then(res => res.json())
    this.activePerson = {
      id,
      details: response
    }
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
}

const APP_STORE = new AppStore()
window.appStore = APP_STORE
export default APP_STORE
