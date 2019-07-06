import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  cursor: pointer;

  > *:not(:first-child) {
    margin-top: 8px;
  }
`

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
  renderByKey = (key) => {
    const { highlight, properties } = this.props;
    return key in highlight
      ? highlightedText(key, highlight[key])
      : originalText(key, properties[key])
  }

  render() {
    return (
      <Wrapper
        onClick={() => this.props.onItemClick(this.props.id)}
      >
        <div style={{ textAlign: 'right' }}>{this.props.properties.date}</div>
        {this.renderByKey('from')}
        {this.renderByKey('to')}
        {this.renderByKey('subject')}
        {this.renderByKey('body')}
      </Wrapper>
    )
  }
}
