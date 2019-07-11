import React from 'react'
import { observer } from 'mobx-react'
import { Modal } from 'antd'
import EmailDetailView from '../modals/EmailDetailView'

@observer
export default class EmailSearchResultModal extends React.Component {
  onOk = () => {
    appStore.toggleModal('emailSearchResult')
  }

  render() {
    return (
      <Modal
        visible
        onCancel={this.onOk}
        onOk={this.onOk}
        width="75%"
        title={'Email Detail Viewer'}
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
