import React from 'react'
import { observer } from 'mobx-react'
import { Icon, Input, List, Row, Col, Pagination } from 'antd'

import appStore from '../../stores/AppStore'
import Card from '../Card'
import EmailSearchResultItem from './EmailSearchResultItem'
import { StyledListItem } from "../styled"

const PAGE_SIZE = 5

@observer
export default class EmailSearch extends React.Component {
  state = {
    pageNum: 1
  }

  onSearch = async e => {
    const { value } = e.target
    this.setState({ pageNum: 1 })
    await appStore.submitEmailSearch(value, PAGE_SIZE)
  }

  onItemClick(id) {
    appStore.setActiveSearchEmail(id)
    appStore.toggleModal('emailSearchResult')
  }

  onPageChange = async (pageNum, pageSize) => {
    this.setState({ pageNum })
    await appStore.submitEmailSearch(appStore.searchQuery, PAGE_SIZE, pageNum)
  }

  render() {
    let maybeContent = null
    if (appStore.searchQuery) {
      maybeContent = <>
        <div style={{ margin: '16px 0' }}>
          <List
            bordered
            dataSource={appStore.emailSearchResults.hits}
            renderItem={item => (
              <StyledListItem>
                <EmailSearchResultItem
                  id={item.id}
                  highlight={item.highlight}
                  properties={item.properties}
                  onItemClick={this.onItemClick}
                />
              </StyledListItem>
            )}
          />
        </div>
        {appStore.emailSearchResults.hits.length > 0 ? <Pagination
          pageSize={PAGE_SIZE}
          current={this.state.pageNum}
          total={appStore.emailSearchResults.total}
          onChange={this.onPageChange}
        /> : null}
      </>
    }

    return (
      <Card>
        <Input
          prefix={<Icon type="search" />}
          placeholder="Type a search query against the emails..."
          onPressEnter={this.onSearch}
        />
        {maybeContent}
      </Card>
    )
  }
}
