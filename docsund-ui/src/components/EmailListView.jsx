import React from 'react'
import { observer } from 'mobx-react'
import { Table } from 'antd'
import appStore from '../stores/AppStore'
import { formatDate } from '../utils'
import EmailContentPreview from './EmailContentPreview'

@observer
export default class EmailListView extends React.Component {
  onRowClick = (record, rowIndex) => {
    return () => {
      appStore.setActiveEmail(record.id)
      appStore.setEmailModalView('detail')
    }
  }

  render() {
    return (
      <Table
        scroll={{ x: true }}
        onRow={(record, rowIndex) => {
          return {
            onClick: this.onRowClick(record, rowIndex)
          }
        }}
        showHeader={false}
        columns={[
          {key: 'from', render: (text, record) => record.properties.from},
          {key: 'content', render: (text, record) => <EmailContentPreview subject={record.properties.subject} body={record.properties.body} />},
          {key: 'date', render: (text, record) => formatDate(record.properties.date)},
        ]}
        dataSource={appStore.activeRelationship.emails}
      />
    )
  }
}

