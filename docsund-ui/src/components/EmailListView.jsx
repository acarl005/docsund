import React from 'react'
import { Table } from 'antd'
import { formatDate } from '../utils'
import EmailContentPreview from './EmailContentPreview'

export default class EmailListView extends React.Component {
  getColumnConfig() {
    return [
      {key: 'from', render: (text, record) => record.properties.from},
      {key: 'content', render: (text, record) => <EmailContentPreview subject={record.properties.subject} body={record.properties.body} />},
      {key: 'date', render: (text, record) => formatDate(record.properties.date)},
    ]
  }

  render() {
    const { emails, onDetailViewClick } = this.props
    return (
      <Table
        scroll={{ x: true }}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => onDetailViewClick(record)
          }
        }}
        showHeader={false}
        columns={this.getColumnConfig()}
        dataSource={emails}
      />
    )
  }
}

