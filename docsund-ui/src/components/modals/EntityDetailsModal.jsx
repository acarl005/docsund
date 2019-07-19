import React, { Component } from "react"
import { observer } from "mobx-react"
import { Row, Col, List, Modal, Typography } from "antd"
const { Title } = Typography

import appStore from "../../stores/AppStore"
import { deepEquals } from "../../utils"
import { StyledListItem } from "./styled"

@observer
export default class EntityDetailsModal extends Component {
  onClose() {
    appStore.toggleModal("entityDetails")
  }

  async onPersonClick(person) {
    await appStore.getEmailsAbout(person, appStore.activeNode.node)
    appStore.toggleModal("relationshipEmails")
  }

  async onEntityClick(entity) {
    await appStore.getEmailsMentioning(entity, appStore.activeNode.node)
    appStore.toggleModal("relationshipEmails")
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
          ...neighbour,
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
          ...neighbour,
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
        onCancel={this.onClose}
        visible
        width="75%"
        title={appStore.activeNode.node.propertyMap.name}
        footer={null}
      >
        <Row>
          <Col span={12} style={{ paddingRight: "10px" }}>
            <List
              header={<Title level={4}>Mentioned by</Title>}
              pagination={{ pageSize: 10 }}
              dataSource={this.formattedPersonDetails()}
              renderItem={item => (
                <StyledListItem
                  onClick={() => this.onPersonClick(item)}
                >
                  <List.Item.Meta title={item.propertyMap.email} />
                  <div>{item.count} mentions</div>
                </StyledListItem>
              )}
            />
          </Col>
          <Col span={12} style={{ paddingLeft: "10px" }}>
            <List
              header={<Title level={4}>Mentioned with</Title>}
              pagination={{ pageSize: 10 }}
              dataSource={this.formattedEntityDetails()}
              renderItem={item => (
                <StyledListItem
                  onClick={() => this.onEntityClick(item)}
                >
                  <List.Item.Meta title={item.propertyMap.name} />
                  <div>{item.count} cooccurences</div>
                </StyledListItem>
              )}
            />
          </Col>
        </Row>
      </Modal>
    )
  }
}
