import React from 'react'
import { StyledItem } from "./styled"
import { LeftRightContainer } from "../styled"
import { formatDate } from "../../utils"


const highlightedText = (key, val) => (
  <div
    style={{ color: 'black', fontWeight: 'bold' }}
    dangerouslySetInnerHTML={{ __html: `${key}: ${val.join(', ')}` }}
  />
)

const originalText = (key, val) => (
  <div
    style={{
      width: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {key}: {val}
  </div>
)

export default class EmailSearchResultItem extends React.Component {
  renderByKey(key) {
    const { highlight, properties } = this.props;
    return key in highlight
      ? highlightedText(key, highlight[key])
      : originalText(key, properties[key])
  }

  render() {
    return (
      <StyledItem
        onClick={() => this.props.onItemClick(this.props.id)}
      >
        <LeftRightContainer left={this.renderByKey('from')}
                            right={formatDate(this.props.properties.date)} />
        {this.renderByKey('to')}
        {this.renderByKey('subject')}
        {this.renderByKey('body')}
      </StyledItem>
    )
  }
}
