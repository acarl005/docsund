import React from 'react'
import { observer } from 'mobx-react'
import { Skeleton, Modal, Typography, Tag } from 'antd'

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
        title = <span>
          Emails between <Tag color="purple">{fromNode.propertyMap.email}</Tag>
          and <Tag color="purple">{toNode.propertyMap.email}</Tag>
        </span>
      } else {
        title = <span>
          Emails to/from <Tag color="purple">{fromNode.propertyMap.email}</Tag>
          mentioning <Tag color="blue">{toNode.propertyMap.name}</Tag>
        </span>
      }
    } else {
      title = <span>
        Emails mentioning <Tag color="blue">{fromNode.propertyMap.name}</Tag>
        and <Tag color="blue">{toNode.propertyMap.name}</Tag>
      </span>
    }

    const EmailView = appStore.emailModalView === 'list'
      ? <EmailListView
          emails={appStore.activeRelationship.emails}
          onDetailViewClick={this.onDetailViewClick}
        />
      : <EmailDetailView
          clickBack={this.clickBack}
          date={appStore.activeEmail.properties.date}
          from={appStore.activeEmail.properties.from}
          to={appStore.activeEmail.properties.to}
          body={appStore.activeEmail.properties.body}
          subject={appStore.activeEmail.properties.subject}
          onListViewClick={this.onListViewClick}
        />

    return (
      <Modal
        visible
        onCancel={this.onClose}
        width="75%"
        title={title}
        footer={null}
      >
        {appStore.loadingRelationshipEmails
          ? <Skeleton
              paragraph={{ rows: 20 }}
              loading
              active
            />
          : EmailView}
      </Modal>

    )
  }
}
