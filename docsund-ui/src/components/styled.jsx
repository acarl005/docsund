import React from "react"
import styled from "styled-components"
import { List, Button } from "antd"

const Left = styled.div`
  float: left;
`
const Right = styled.div`
  float: right;
`
const ClearFloat = styled.div`
  clear: both;
`
const LeftRightWrapper = styled.div`
  width: 100%;
`
export function LeftRightContainer(props) {
  return <LeftRightWrapper>
    <Left>{props.left}</Left>
    <Right>{props.right}</Right>
    <ClearFloat />
  </LeftRightWrapper>
}

export const StyledListItem = styled(List.Item)`
  background: white;
  transition: all 0.3s;

  :hover {
    cursor: pointer;
    transform: translate3d(0, -3px, 0);
    box-shadow: 0 4px 4px rgba(1, 67, 163, 0.24), 0 0 4px rgba(1, 67, 163, 0.12), 0 6px 18px rgba(43, 133, 231, 0.12);
  }
`

export const LoadingWidgetContainer = styled.div`
  text-align: center;
  padding-top: 30%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 100;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

export const ExplorerContainer = styled.div`
  ${props => props.fullscreen ? `
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    position: fixed;
  ` : `
    height: 600px;
    position: relative;
  `
  }
`
export const TransparentButton = styled(Button)`
  background: transparent;
  box-shadow: none;
  border: none;
`
