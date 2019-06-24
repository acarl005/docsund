import React from 'react'
import { Modal, Table } from 'antd'

export default class EmailViewer extends React.Component {
  state = {
    emails: [],
    visible: true
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  async componentDidMount() {
    const { toUserId, fromUserId } = this.props
    const emails = await this.getEmailsBetween(toUserId, fromUserId)
    this.setState({ emails })
  }

  async getEmailsBetween(toUserId, fromUserId) {
    const response = await fetch(`http://10.0.0.21:5000/emails?between=${toUserId},${fromUserId}`)
      .then(res => res.json())
    return response
  }

  render() {
    return (
      <Modal
        visible={this.state.visible}
        onCancel={this.hideModal}
        onOk={this.hideModal}
        width="75%"
        title="Email Viewer"
      >
        <Table
          showHeader={false}
          columns={[
            {dataIndex: 'properties.from'},
            {dataIndex: 'properties.subject'},
            {dataIndex: 'properties.body'},
            {dataIndex: 'properties.date'},
          ]}
          dataSource={this.state.emails}
        />
      </Modal>
    )
  }
}
