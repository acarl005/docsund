import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { Button } from 'antd'
import appStore from '../stores/AppStore'
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

@observer
export default class EmailDetailView extends React.Component {
  onClick = () => {
    appStore.setEmailModalView('list')
  }

  render() {
    const { date, from, to, body, subject } = appStore.activeEmail.properties
    return (
      <Wrapper>
        <Button onClick={this.onClick} icon='arrow-left'>Back to List</Button>
        <Subject>{subject}</Subject>
        <div>From: {from}</div>
        <Collapse>To: {to.join(', ')}</Collapse>
        <Body>{body}</Body>
      </Wrapper>
    )
  }
}
