import React from 'react'
import { observer } from 'mobx-react'
import { Modal } from 'antd'

import appStore from '../../stores/AppStore'
import EmailListView from './EmailListView'
import EmailDetailView from './EmailDetailView'

@observer
export default class RelationshipEmails extends React.Component {
  onClose() {
    appStore.toggleModal('relationshipEmails')
    appStore.setEmailModalView('list')
  }

  clickBack() {
    appStore.setEmailModalView('list')
  }

  onListViewClick = () => {
    appStore.setEmailModalView('list')
  }

  onDetailViewClick = (email) => {
    appStore.setActiveEmail(email)
    appStore.setEmailModalView('detail')
  }

  render() {
    if (appStore.activeRelationship === undefined) {
      return null;
    }
    const { fromNode, toNode } = appStore.activeRelationship
    let title
    if (fromNode.labels[0] === "Person") {
      if (toNode.labels[0] === "Person") {
        title = `Emails between ${fromNode.propertyMap.email} and ${toNode.propertyMap.email}`
      } else {
        title = `Emails to/from ${fromNode.propertyMap.email} mentioning ${toNode.propertyMap.name}`
      }
    } else {
      title = `Emails mentioning ${fromNode.propertyMap.name} and ${toNode.propertyMap.name}`
    }

    return (
      <Modal
        visible
        onCancel={this.onClose}
        width="75%"
        title={title}
        footer={null}
      >
        {
          appStore.emailModalView === 'list' ?
            <EmailListView
              emails={appStore.activeRelationship.emails}
              onDetailViewClick={this.onDetailViewClick}
            /> :
            <EmailDetailView
              clickBack={this.clickBack}
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
