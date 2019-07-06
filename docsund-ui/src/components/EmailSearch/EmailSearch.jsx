import React from 'react'
import { observer } from 'mobx-react'
import { Input, List, Row, Col } from 'antd'
import appStore from '../../stores/AppStore'
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
      <>
        <Row>
          <Col span={18} offset={3}>
            <div style={{marginBottom: '16px', marginTop: '30px'}}>
              <Search
                placeholder="Type a search query against the emails..."
                onSearch={this.onSearch}
              />
            </div>
          </Col>
        </Row>

        <Row>
          <Col span={18} offset={3}>
            <div style={{marginBottom: '64px'}}>
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
          </Col>
        </Row>
      </>
    )
  }
}
