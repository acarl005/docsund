import React from 'react'
import { observer } from 'mobx-react'
import { Modal, Table } from 'antd'
import appStore from '../stores/AppStore'
import EmailContentPreview from './EmailContentPreview'

@observer
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
            {key: 'from', render: (text, record) => record.properties.from},
            {key: 'content', render: (text, record) => <EmailContentPreview subject={record.properties.subject} body={record.properties.body} />},
            {key: 'date', render: (text, record) => record.properties.date},
          ]}
          dataSource={this.state.emails}
        />
      </Modal>
    )
  }
}
