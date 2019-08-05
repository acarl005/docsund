import React from "react"
import TweenOne from "rc-tween-one"
import { Menu } from "antd"
import { Link } from "react-router-dom"

const { Item } = Menu

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneOpen: false,
      menuHeight: 0
    }
    this.menu = React.createRef()
  }

  phoneClick = () => {
    const phoneOpen = !this.state.phoneOpen
    this.setState({
      phoneOpen,
      menuHeight: phoneOpen ? this.menu.current.dom.scrollHeight : 0
    })
  };

  render() {
    const { ...props } = this.props
    const { dataSource, isMobile } = props
    delete props.dataSource
    delete props.isMobile
    const { menuHeight, phoneOpen } = this.state
    const navData = dataSource.Menu.children
    const navChildren = [
      <Item key="-1">
        <Link to="/">Home</Link>
      </Item>,
      ...Object.keys(navData).map((key, i) => (
        <Item key={i.toString()}>
          <Link to={navData[key].path}>{navData[key].display}</Link>
        </Item>
      ))
    ]
    return (
      <TweenOne
        component="header"
        animation={{ opacity: 0, type: "from" }}
        {...dataSource.wrapper}
        {...props}
      >
        <div
          {...dataSource.page}
          className={`${dataSource.page.className}${phoneOpen ? " open" : ""}`}
        >
          <TweenOne
            animation={{ x: -30, type: "from", ease: "easeOutQuad" }}
            {...dataSource.logo}
          >
            <img width="100%" src={dataSource.logo.children} alt="img" />
          </TweenOne>
          {isMobile && (
            <div
              {...dataSource.mobileMenu}
              onClick={() => {
                this.phoneClick()
              }}
            >
              <em />
              <em />
              <em />
            </div>
          )}
          <TweenOne
            {...dataSource.Menu}
            animation={{ x: 30, type: "from", ease: "easeOutQuad" }}
            ref={this.menu} // {(c) => { this.menu = c; }}
            style={isMobile ? { height: menuHeight } : null}
          >
            <Menu
              mode={isMobile ? "inline" : "horizontal"}
              defaultSelectedKeys={[navData.findIndex(item => item.path === window.location.pathname).toString()]}
              theme={isMobile ? "dark" : "default"}
            >
              {navChildren}
            </Menu>
          </TweenOne>
        </div>
      </TweenOne>
    )
  }
}

export default Header
