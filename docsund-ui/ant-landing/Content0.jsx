import React from "react"
import QueueAnim from "rc-queue-anim"
import { Row, Col } from "antd"
import OverPack from "rc-scroll-anim/lib/ScrollOverPack"
import { getChildrenToRender } from "./utils"

class Content extends React.PureComponent {
  getBlockChildren = data => data.map((item, i) => {
    const { children } = item
    return (
      <Col key={i.toString()} {...item}>
        <div {...children.content}>{children.content.children}</div>
      </Col>
    )
  });

  render() {
    const { ...props } = this.props
    const { dataSource } = props
    delete props.dataSource
    delete props.isMobile
    const listChildren = this.getBlockChildren(dataSource.block.children)
    return (
      <div {...props} {...dataSource.wrapper}>
        <div {...dataSource.page}>
          <div {...dataSource.titleWrapper}>
            {dataSource.titleWrapper.children.map(getChildrenToRender)}
          </div>
          <OverPack {...dataSource.OverPack}>
            <QueueAnim
              type="bottom"
              key="block"
              leaveReverse
              {...dataSource.block}
              component={Row}
            >
              {listChildren}
            </QueueAnim>
          </OverPack>
        </div>
      </div>
    )
  }
}

export default Content
