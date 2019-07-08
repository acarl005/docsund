import React from 'react'
import { observer } from 'mobx-react'
import { Modal } from 'antd'
import appStore from '../../stores/AppStore'
import EmailListView from './EmailListView'
import EmailDetailView from './EmailDetailView'

@observer
export default class EmailsBetweenModal extends React.Component {
  onOk = () => {
    appStore.toggleModal('topicSample')
    appStore.setEmailModalView('list')
  }

  getColumnConfig() {
    return [
      {
        key: 'from',
        render: (text, record) => record.properties.from
      },
      {
        key: 'content',
        render: (text, record) => (
          <EmailContentPreview
            subject={record.properties.subject}
            body={record.properties.body}
          />
        )
      },
      {
        key: 'date',
        render: (text, record) => formatDate(record.properties.date)
      },
    ]
  }

  onListViewClick = () => {
    appStore.setEmailModalView('list')
  }

  onDetailViewClick = (email) => {
    appStore.setActiveEmail(email)
    appStore.setEmailModalView('detail')
  }

  render() {
    return (
      <Modal
        visible
        onCancel={this.onOk}
        onOk={this.onOk}
        width="75%"
        title="Sample Emails for Topic"
      >
        {
          appStore.emailModalView === 'list' ?
            <EmailListView
              emails={appStore.topicEmails}
              onDetailViewClick={this.onDetailViewClick}
            /> :
            <EmailDetailView
              date={appStore.activeEmail.properties.date}
              from={appStore.activeEmail.properties.from}
              to={appStore.activeEmail.properties.to}
              body={appStore.activeEmail.properties.body}
              subject={appStore.activeEmail.properties.subject}
              onListViewClick={this.onListViewClick}
            />
        }
      </Modal>
    )
  }
}
