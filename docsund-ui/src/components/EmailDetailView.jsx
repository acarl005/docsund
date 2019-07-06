import React from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import Collapse from './Collapse'

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
  render() {
    const { date, from, to, body, subject, onListViewClick } = this.props;
    return (
      <Wrapper>
        <Button onClick={onListViewClick} icon='arrow-left'>Back to List</Button>
        <Subject>{subject}</Subject>
        <div>From: {from}</div>
        <Collapse>To: {to.join(', ')}</Collapse>
        <Body>{body}</Body>
      </Wrapper>
    )
  }
}
