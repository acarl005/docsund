import React from 'react'
import { observer } from 'mobx-react'
import { Modal } from 'antd'
import EmailDetailView from '../modals/EmailDetailView'

@observer
export default class EmailSearchResultModal extends React.Component {
  onClose() {
    appStore.toggleModal('emailSearchResult')
  }

  render() {
    return (
      <Modal
        visible
        onCancel={this.onClose}
        width="75%"
        title={"Email Viewer"}
        footer={null}
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
