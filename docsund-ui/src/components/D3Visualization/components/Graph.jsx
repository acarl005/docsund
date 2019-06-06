import React, { Component } from 'react'
import { createGraph, mapRelationships, getGraphStats } from '../mapper'
import { GraphEventHandler } from '../GraphEventHandler'
import '../lib/visualization/index'
//import { dim } from 'browser-styles/constants'
import { StyledZoomHolder, StyledSvgWrapper, StyledZoomButton } from './styled'
//import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'

const dim = {
  // Editor bar
  editorbarHeight: 71,
  // Frame
  frameBodyHeight: 550,
  frameTitlebarHeight: 39,
  frameStatusbarHeight: 39,
  frameBodyPadding: 20
}

export class GraphComponent extends Component {
  state = {
    zoomInLimitReached: true,
    zoomOutLimitReached: false,
    shouldResize: false
  }

  graphInit (el) {
    this.svgElement = el
  }

  zoomInClicked (el) {
    let limits = this.graphView.zoomIn(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  zoomOutClicked (el) {
    let limits = this.graphView.zoomOut(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  getVisualAreaHeight () {
    return this.props.frameHeight && this.props.fullscreen
      ? this.props.frameHeight -
          (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2)
      : this.props.frameHeight - dim.frameStatusbarHeight ||
          this.svgElement.parentNode.offsetHeight
  }

  componentDidMount () {
    if (this.svgElement != null) {
      this.initGraphView()
      this.graph && this.props.setGraph && this.props.setGraph(this.graph)
      this.props.getAutoCompleteCallback &&
        this.props.getAutoCompleteCallback(this.addInternalRelationships)
      this.props.assignVisElement &&
        this.props.assignVisElement(this.svgElement, this.graphView)
    }
  }

  initGraphView () {
    if (!this.graphView) {
      let NeoConstructor = graphView
      let measureSize = () => {
        return {
          width: this.svgElement.offsetWidth,
          height: this.getVisualAreaHeight()
        }
      }
      this.graph = createGraph(this.props.nodes, this.props.relationships)
      this.graphView = new NeoConstructor(
        this.svgElement,
        measureSize,
        this.graph,
        this.props.graphStyle
      )
      this.graphEH = new GraphEventHandler(
        this.graph,
        this.graphView,
        this.props.getNodeNeighbours,
        this.props.onItemMouseOver,
        this.props.onItemSelect,
        this.props.onGraphModelChange
      )
      this.graphEH.bindEventHandlers()
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.resize()
      this.graphView.update()
    }
  }

  addInternalRelationships = internalRelationships => {
    if (this.graph) {
      this.graph.addInternalRelationships(
        mapRelationships(internalRelationships, this.graph)
      )
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.update()
      this.graphEH.onItemMouseOut()
    }
  }

  componentWillReceiveProps (props) {
    if (props.styleVersion !== this.props.styleVersion) {
      this.graphView.update()
    }
    if (
      this.props.fullscreen !== props.fullscreen ||
      this.props.frameHeight !== props.frameHeight
    ) {
      this.setState({ shouldResize: true })
    } else {
      this.setState({ shouldResize: false })
    }
  }

  componentDidUpdate () {
    if (this.state.shouldResize) {
      this.graphView.resize()
    }
  }

  zoomButtons () {
    if (this.props.fullscreen) {
      return (
        <StyledZoomHolder>
          <StyledZoomButton
            className={
              this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'
            }
            onClick={this.zoomInClicked.bind(this)}
          >
            {/*<ZoomInIcon />*/}
            <span>zoom in</span>
          </StyledZoomButton>
          <StyledZoomButton
            className={
              this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'
            }
            onClick={this.zoomOutClicked.bind(this)}
          >
            {/*<ZoomOutIcon />*/}
            <span>zoom out</span>
          </StyledZoomButton>
        </StyledZoomHolder>
      )
    }
    return null
  }

  render () {
    return (
      <StyledSvgWrapper>
        <svg className='neod3viz' ref={this.graphInit.bind(this)} />
        {this.zoomButtons()}
      </StyledSvgWrapper>
    )
  }
}
