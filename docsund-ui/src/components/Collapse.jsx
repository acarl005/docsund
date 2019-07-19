import React from 'react'
import styled from 'styled-components'
import { Button } from 'antd'

const collapsedStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}

export default class Collapse extends React.Component {
  state = {
    collapsed: true,
    overflowActive: false
  }

  isEllipsisActive(e) {
    return e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth;
  }

  componentDidMount() {
    this.setState({ overflowActive: this.isEllipsisActive(this.span) });
  }

  onClick = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    return (
      <div style={this.props.style}>
        <div
          style={this.state.collapsed ? collapsedStyle : {}}
          ref={ref => (this.span = ref)}
        >
          {this.props.children}
        </div>
        {this.state.overflowActive &&
          <Button
            type='link'
            onClick={this.onClick}
          >
            {this.state.collapsed ? '+ Expand' : '- Collapse'}
          </Button>
        }
      </div>
    )
  }
}
