import React from 'react'
import { observer } from 'mobx-react'
import { Modal, Button, Icon } from 'antd'
import EmailDetailView from '../modals/EmailDetailView'

@observer
export default class EmailSearchResultModal extends React.Component {
  onClose() {
    appStore.toggleModal('emailSearchResult')
  }

  async handleExploreButton() {
    appStore.toggleModal('emailSearchResult')
    await appStore.exploreEmail(appStore.activeSearchEmail)
  }

  render() {
    return (
      <Modal
        visible
        onCancel={this.onClose}
        width="75%"
        title={"Email Viewer"}
        footer={
          <Button icon="deployment-unit" type="primary" onClick={this.handleExploreButton}>
            Explore
          </Button>
        }
      >
        <EmailDetailView
          date={appStore.activeSearchEmail.properties.date}
          from={appStore.activeSearchEmail.properties.from}
          to={appStore.activeSearchEmail.properties.to}
          body={appStore.activeSearchEmail.properties.body}
          subject={appStore.activeSearchEmail.properties.subject}
        />
      </Modal>
    )
  }
}
