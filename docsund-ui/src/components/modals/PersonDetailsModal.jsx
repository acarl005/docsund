import React, { Component } from "react"
import { observer } from "mobx-react"
import {
  Skeleton, Row, Col, List, Modal, Typography, Tag
} from "antd"

import appStore from "../../stores/AppStore"
import { deepEquals } from "../../utils"
import { StyledListItem } from "./styled"

const { Title } = Typography

@observer
export default class PersonDetailsModal extends Component {
  onClose() {
    appStore.toggleModal("personDetails")
  }

  async onPersonClick(neighbour) {
    appStore.toggleModal("relationshipEmails")
    await appStore.getEmailsBetween(neighbour, appStore.activeNode.node)
  }

  async onEntityClick(entity) {
    appStore.toggleModal("relationshipEmails")
    await appStore.getEmailsAbout(appStore.activeNode.node, entity)
  }

  formattedPersonDetails() {
    const { activeNode } = appStore
    const { neighbours, relationships } = activeNode.details
    const relationshipMap = {}
    for (const rel of relationships) {
      relationshipMap[rel.startNodeId === activeNode.node.id ? rel.endNodeId : rel.startNodeId] = rel
    }
    return neighbours
      .filter(node => deepEquals(node.labels, ["Person"]))
      .map(neighbour => {
        const rel = relationshipMap[neighbour.id]
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
    const relationshipMap = {}
    for (const rel of relationships) {
      relationshipMap[rel.startNodeId === activeNode.node.id ? rel.endNodeId : rel.startNodeId] = rel
    }
    return neighbours
      .filter(node => node.labels.includes("Entity"))
      .map(neighbour => {
        const rel = relationshipMap[neighbour.id]
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
        title={
          appStore.activeNode
            ? <Tag color="purple">{appStore.activeNode.node.propertyMap.email}</Tag>
            : "..."
        }
        footer={null}
      >
        <Row>
          <Col span={12} style={{ paddingRight: "10px" }}>
            {appStore.loadingNodeDetails
              ? (
                <Skeleton
                  paragraph={{ rows: 20 }}
                  loading
                  active
                />
              )
              : (
                <List
                  header={<Title level={4}>Emails with</Title>}
                  pagination={{ pageSize: 10 }}
                  dataSource={this.formattedPersonDetails()}
                  renderItem={item => (
                    <StyledListItem
                      onClick={() => this.onPersonClick(item)}
                    >
                      <List.Item.Meta title={item.propertyMap.email} />
                      <div>
                        {item.count}
                        {" "}
emails
                      </div>
                    </StyledListItem>
                  )}
                />
              )
            }
          </Col>
          <Col span={12} style={{ paddingLeft: "10px" }}>
            {appStore.loadingNodeDetails
              ? (
                <Skeleton
                  paragraph={{ rows: 20 }}
                  loading
                  active
                />
              )
              : (
                <List
                  header={<Title level={4}>Entities discussed</Title>}
                  pagination={{ pageSize: 10 }}
                  dataSource={this.formattedEntityDetails()}
                  renderItem={item => (
                    <StyledListItem
                      onClick={() => this.onEntityClick(item)}
                    >
                      <List.Item.Meta title={item.propertyMap.name} />
                      <div>
                        {item.count}
                        {" "}
mentions
                      </div>
                    </StyledListItem>
                  )}
                />
              )
            }
          </Col>
        </Row>
      </Modal>
    )
  }
}
