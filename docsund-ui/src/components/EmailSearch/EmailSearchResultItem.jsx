import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import appStore from '../../stores/AppStore'

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

@observer
export default class EmailSearchResultItem extends React.Component {
  onClick = () => {
    appStore.setActiveEmail(this.props.id)
    appStore.toggleModal('email')
  }

  renderByKey = (key) => {
    const { highlight, properties } = this.props;
    return key in highlight
      ? highlightedText(key, highlight[key])
      : originalText(key, properties[key])
  }

  render() {
    return (
      <Wrapper
        onClick={this.onClick}
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
