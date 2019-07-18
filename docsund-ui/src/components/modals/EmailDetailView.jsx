import React from 'react'
import styled from 'styled-components'
import { Button } from 'antd'

import Collapse from '../Collapse'
import appStore from '../../stores/AppStore'

const Wrapper = styled.div`
  > *:not(:first-child) {
    margin-top: 16px;
  }
`

const ToList = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const Subject = styled.div`
  font-size: 16px;
`

const Body = styled.div`
  width: 100%;
  white-space: pre-wrap;
  display: block;
  padding-top: 16px;
  color: black;
`

export default class EmailDetailView extends React.Component {
  backButton() {
    appStore.setEmailModalView('list')
  }

  render() {
    const { date, from, to, body, subject, onListViewClick } = this.props;
    const toAsString = typeof to === 'object' ? to.join(', ') : to
    return (
      <Wrapper>
        <Button icon="arrow-left" onClick={() => this.backButton()}>Back</Button>
        {this.onListViewClick && <Button onClick={onListViewClick} icon='arrow-left'>Back to List</Button>}
        <div style={{textAlign: 'right'}}>{date}</div>
        <Subject>{subject}</Subject>
        <div>From: {from}</div>
        <Collapse>To: {toAsString}</Collapse>
        <Body>{body}</Body>
      </Wrapper>
    )
  }
}
