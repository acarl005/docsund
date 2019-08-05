import styled from "styled-components"
import { StyledListItem as BaseStyledListItem } from "../styled"

// eslint-disable-next-line import/prefer-default-export
export const StyledListItem = styled(BaseStyledListItem)`
  padding-left: 5px;
  padding-right: 5px;
  background: white;
  transition: all 0.3s;

  :hover {
    cursor: pointer;
    transform: translate3d(0, -3px, 0);
    box-shadow: 0 4px 4px rgba(1, 67, 163, 0.24), 0 0 4px rgba(1, 67, 163, 0.12), 0 6px 18px rgba(43, 133, 231, 0.12);
  }
`
