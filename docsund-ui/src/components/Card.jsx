import React from "react"
import styled from "styled-components"

const Wrapper = styled.div`
  padding: 16px;
  box-shadow: 0 2px 2px -1px rgba(153, 153, 153, 0.3), 0 1px 5px -2px rgba(153, 153, 153, 0.3);
  background-color: white;
`

export default function Card(props) {
  return (
    <Wrapper>
      {props.children}
    </Wrapper>
  )
}
