import React from 'react'
import { observer } from 'mobx-react'
import { Input, List, Row, Col } from 'antd'
import appStore from '../../stores/AppStore'
import Card from '../Card'
import EmailSearchResultItem from './EmailSearchResultItem'

const { Search } = Input

@observer
export default class EmailSearch extends React.Component {
  onSearch = (val) => {
    appStore.submitEmailSearch(val)
  }

  onItemClick = (id) => {
    appStore.setActiveSearchEmail(id)
    appStore.toggleModal('emailSearchResult')
  }

  render() {
    return (
      <Card>
        <Search
          placeholder="Type a search query against the emails..."
          onSearch={this.onSearch}
        />
        <div style={{margin: '16px 0'}}>
          <List
            bordered
            dataSource={appStore.emailSearchResults}
            renderItem={item => (
              <List.Item>
                <EmailSearchResultItem
                  id={item.id}
                  highlight={item.highlight}
                  properties={item.properties}
                  onItemClick={this.onItemClick}
                />
              </List.Item>
            )}
          />
        </div>
      </Card>
    )
  }
}
