import React, { Component } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'

import Collapse from '../Collapse'
import appStore from '../../stores/AppStore'
import { LeftRightContainer } from "../styled"
import { formatDate } from "../../utils"

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
  padding-top: 10px;
  color: black;
`

export default class EmailDetailView extends Component {
  render() {
    const { date, from, to, body, subject, onListViewClick } = this.props;
    const toAsString = typeof to === 'object' ? to.join(', ') : to
    return (
      <Wrapper>
        {this.props.clickBack ? <Button icon="arrow-left" onClick={this.props.clickBack}>Back</Button> : ""}
        {this.onListViewClick && <Button onClick={onListViewClick} icon='arrow-left'>Back to List</Button>}
        <LeftRightContainer left={<Subject>{subject}</Subject>}
                            right={formatDate(date)} />
        <div>From: {from}</div>
        <Collapse style={{ marginTop: 0 }}>To: {toAsString}</Collapse>
        <Body>{body}</Body>
      </Wrapper>
    )
  }
}
