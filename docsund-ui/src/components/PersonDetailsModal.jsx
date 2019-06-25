import React, { Component } from "react"
import { observer } from 'mobx-react'
import { List, Modal } from 'antd'
import appStore from '../stores/AppStore'

@observer
export default class PersonDetailsModal extends Component {
  async onRowClick(neighbourId) {
    await appStore.getEmailsBetween(neighbourId, appStore.activePerson.id)
    appStore.toggleModal("email")
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
        visible={appStore.modalVisibility.personDetails}
        title="Person Details"
      >
        <List
          pagination={{
            pageSize: 20
          }}
          dataSource={this.formattedPersonDetails()}
          renderItem={item => (
            <List.Item
              onClick={() => this.onRowClick(item.id)}
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
