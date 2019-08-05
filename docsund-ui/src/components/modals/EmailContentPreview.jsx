import React from "react"
import styled from "styled-components"

const Wrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 700px;
`

const Subject = styled.span`
  font-weight: 500;
`

const Body = styled.span`
  color: #A9A9A9;
`

export default function EmailContentPreview(props) {
  return (
    <Wrapper>
      <Subject>{props.subject}</Subject>
      <span> - </span>
      <Body>{props.body}</Body>
    </Wrapper>
  )
}
