import React from "react"
import { observer } from "mobx-react"
import {
  Skeleton, Icon, Input, List, Pagination
} from "antd"

import appStore from "../../stores/AppStore"
import Card from "../Card"
import EmailSearchResultItem from "./EmailSearchResultItem"
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
    appStore.toggleModal("emailSearchResult")
  }

  onPageChange = async pageNum => {
    this.setState({ pageNum })
    await appStore.submitEmailSearch(appStore.emailSearchQuery, PAGE_SIZE, pageNum)
  }

  render() {
    let maybeContent = null
    if (appStore.emailSearchQuery) {
      maybeContent = (
        <>
          <div style={{ margin: "16px 0" }}>
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
          {/* the page window has a hard maximum at 10,000 set by elasticsearch */}
          {appStore.emailSearchResults.hits.length > 0 ? (
            <Pagination
              pageSize={PAGE_SIZE}
              current={this.state.pageNum}
              total={Math.min(appStore.emailSearchResults.total, 10000)}
              onChange={this.onPageChange}
            />
          ) : null}
        </>
      )
    } else if (appStore.loadingEmailSearch) {
      maybeContent = <SkeletonList />
    }

    return (
      <Card>
        <Input
          prefix={<Icon type="search" />}
          placeholder="search email contents"
          onPressEnter={this.onSearch}
          id="search-information"
        />
        {maybeContent}
      </Card>
    )
  }
}

function SkeletonList() {
  return (
    <List
      dataSource={new Array(4).fill({})}
      renderItem={() => (
        <List.Item>
          <Skeleton active loading />
        </List.Item>
      )}
    />
  )
}
