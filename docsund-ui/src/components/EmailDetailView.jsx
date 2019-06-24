import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { Button } from 'antd'
import appStore from '../stores/AppStore'

const Wrapper = styled.div`
  > *:not(:first-child) {
    margin-top: 16px;
  }
`

const Subject = styled.div`
  font-size: 16px;
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
        <div>To: {to.join(', ')}</div>
        <div>{body}</div>
      </Wrapper>
    )
  }
}
