import { action, observable } from 'mobx'

class AppStore {
}

const APP_STORE = new AppStore()
window.appStore = APP_STORE
export default APP_STORE
