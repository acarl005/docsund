import React, { Component } from "react"
import { observer } from 'mobx-react'
import { List, Modal } from 'antd'
import appStore from '../stores/AppStore'

@observer
export default class PersonDetailsModal extends Component {
  onOk = () => {
    appStore.toggleModal('personDetails')
  }

  async onRowClick(neighbour) {
    await appStore.getEmailsBetween(neighbour, appStore.activePerson)
    appStore.toggleModal('emailsBetween')
  }

  formattedPersonDetails() {
    return appStore.activePerson.details.relationships.map(rel => {
      const otherPerson = appStore.activePerson.details.neighbours.find(
        neighbour => neighbour.id === (
          rel.startNodeId === appStore.activePerson.id ? rel.endNodeId : rel.startNodeId
        )
      )
      return {
        id: otherPerson.id,
        count: rel.properties.count,
        email: otherPerson.properties.email
      }
    })
  }
  render() {
    if (appStore.activePerson === undefined) {
      return null
    }
    return (
      <Modal
        onCancel={this.onOk}
        onOk={this.onOk}
        visible
        title={`Emails of ${appStore.activePerson.email}`}
      >
        <List
          pagination={{
            pageSize: 20
          }}
          dataSource={this.formattedPersonDetails()}
          renderItem={item => (
            <List.Item
              onClick={() => this.onRowClick({ id: item.id, email: item.email })}
            >
              <List.Item.Meta
                title={item.email}
                description={item.count}
              />
            </List.Item>
          )}
        />
      </Modal>
    )
  }
}
