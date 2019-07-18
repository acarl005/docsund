import React, { Component } from "react"
import { observer } from "mobx-react"
import { Row, Col, List, Modal, Typography } from "antd"
const { Title } = Typography

import appStore from "../../stores/AppStore"
import { deepEquals } from "../../utils"
import { StyledListItem } from "./styled"

@observer
export default class PersonDetailsModal extends Component {
  onOk() {
    appStore.toggleModal('personDetails')
  }

  async onPersonClick(neighbour) {
    await appStore.getEmailsBetween(neighbour, appStore.activeNode.node)
    appStore.toggleModal("emailsBetween")
  }

  async onEntityClick(entity) {
    await appStore.getEmailsAbout(appStore.activeNode.node, entity)
    appStore.toggleModal("emailsAbout")
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
          propertyMap: neighbour.properties
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
          count: rel.properties.count,
          propertyMap: neighbour.properties
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
          <Col span={12} style={{ paddingRight: "10px" }}>
            <List
              header={<Title level={4}>Emails with</Title>}
              pagination={{ pageSize: 10 }}
              dataSource={this.formattedPersonDetails()}
              renderItem={item => (
                <StyledListItem
                  onClick={() => this.onPersonClick(item)}
                >
                  <List.Item.Meta title={item.propertyMap.email} />
                  <div>{item.count} emails</div>
                </StyledListItem>
              )}
            />
          </Col>
          <Col span={12} style={{ paddingLeft: "10px" }}>
            <List
              header={<Title level={4}>Entities discussed</Title>}
              pagination={{ pageSize: 10 }}
              dataSource={this.formattedEntityDetails()}
              renderItem={item => (
                <StyledListItem
                  onClick={() => this.onEntityClick(item)}
                >
                  <List.Item.Meta title={item.propertyMap.name} />
                  <div>{item.count} mentions</div>
                </StyledListItem>
              )}
            />
          </Col>
        </Row>
      </Modal>
    )
  }
}
