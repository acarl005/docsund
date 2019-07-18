import styled from "styled-components"
import { List } from "antd"

export const StyledListItem = styled(List.Item)`
  padding-left: 5px;
  padding-right: 5px;
  transition: all 0.3s;
  background: white;

  :hover {
    cursor: pointer;
    transform: translate3d(0, -3px, 0);
    box-shadow: 0 4px 4px rgba(1, 67, 163, 0.24), 0 0 4px rgba(1, 67, 163, 0.12), 0 6px 18px rgba(43, 133, 231, 0.12);
  }
`
