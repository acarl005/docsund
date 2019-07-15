import React, { Component } from "react"
import { observer } from "mobx-react"
import { Row, Col, List, Modal } from "antd"

import appStore from "../../stores/AppStore"
import { deepEquals } from "../../utils"

@observer
export default class NodeDetailsModal extends Component {
  onOk() {
    appStore.toggleModal('nodeDetails')
  }

  async onRowClick(neighbour) {
    await appStore.getEmailsBetween(neighbour, appStore.activeNode)
    appStore.toggleModal('emailsBetween')
  }

  formattedPersonDetails() {
    const { activeNode } = appStore
    const { neighbours, relationships } = activeNode.details
    return neighbours
      .filter(node => deepEquals(node.labels, ["Person"]))
      .map(neighbour => {
        const rel = relationships.find(rel =>
          neighbour.id === (rel.startNodeId === activeNode.node.id ? rel.endNodeId : rel.startNodeId)
        )
        return {
          id: neighbour.id,
          count: rel.properties.count,
          email: neighbour.properties.email
        }
      })
  }

  formattedEntityDetails() {
    const { activeNode } = appStore
    const { neighbours, relationships } = activeNode.details
    return neighbours
      .filter(node => node.labels.includes("Entity"))
      .map(neighbour => {
        const rel = relationships.find(rel =>
          neighbour.id === (rel.startNodeId === activeNode.node.id ? rel.endNodeId : rel.startNodeId)
        )
        return {
          id: neighbour.id,
          count: neighbour.properties.mentions,
          name: neighbour.properties.name
        }
      })
  }

  render() {
    if (appStore.activeNode === undefined) {
      return null
    }
    return (
      <Modal
        onCancel={this.onOk}
        onOk={this.onOk}
        visible
        width="75%"
        title={appStore.activeNode.node.propertyMap.email}
      >
        <Row>
          <Col span={12}>
            <List
              header="Emails with"
              pagination={{ pageSize: 12 }}
              dataSource={this.formattedPersonDetails()}
              renderItem={item => (
                <List.Item
                  onClick={() => this.onRowClick({ id: item.id, email: item.email })}
                >
                  <List.Item.Meta title={item.email} />
                  <div>{item.count} emails</div>
                </List.Item>
              )}
            />
          </Col>
          <Col span={12}>
            <List
              header="Entities discussed"
              pagination={{ pageSize: 12 }}
              dataSource={this.formattedEntityDetails()}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={item.name} />
                  <div>{item.count} mentions</div>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Modal>
    )
  }
}
