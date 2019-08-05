import React from "react"
import { observer } from "mobx-react"
import { Modal, Skeleton } from "antd"
import appStore from "../../stores/AppStore"
import EmailListView from "./EmailListView"
import EmailDetailView from "./EmailDetailView"

@observer
export default class TopicSampleModal extends React.Component {
  onClose() {
    appStore.toggleModal("topicSample")
    appStore.setEmailModalView("list")
  }

  clickBack() {
    appStore.setEmailModalView("list")
  }

  onListViewClick = () => {
    appStore.setEmailModalView("list")
  }

  onDetailViewClick = email => {
    appStore.setActiveEmail(email)
    appStore.setEmailModalView("detail")
  }

  render() {
    const emailView = appStore.emailModalView === "list" ? (
      <EmailListView
        emails={appStore.topicEmails}
        onDetailViewClick={this.onDetailViewClick}
      />
    )
      : (
        <EmailDetailView
          clickBack={this.clickBack}
          date={appStore.activeEmail.properties.date}
          from={appStore.activeEmail.properties.from}
          to={appStore.activeEmail.properties.to}
          body={appStore.activeEmail.properties.body}
          subject={appStore.activeEmail.properties.subject}
          onListViewClick={this.onListViewClick}
        />
      )
    return (
      <Modal
        visible
        onCancel={this.onClose}
        width="75%"
        title="Sample Emails for Topic"
        footer={null}
      >
        {appStore.topicSampleLoading
          ? (
            <Skeleton
              paragraph={{ rows: 20 }}
              loading
              active
            />
          )
          : emailView
        }
      </Modal>
    )
  }
}
