import React, {Component} from 'react';
import {Row, Col} from 'antd';
import './TopicExplorer.css';
import 'antd/dist/antd.css';
import {select} from 'd3-selection';
import {topicExplorer} from './topic-explorer';


export default class TopicExplorer extends Component {

  componentDidMount() {
    this.drawTopicExplorer();
  }

  fetchTopicData(topicNum) {
    return this.allTopicsData[topicNum].coordinates;
  }

  drawTopicExplorer() {
    // Create the div to house the topic explorer
    var topicExporerDiv = select("body")
        .append("div")
        .attr("id", "topic-explorer");

    // Fit initial topic model with 10 topics & 20 top words
    const defaultNumTopics = 16;

    // Fetch the topic coordinates, then add in the base64 encoded images
    var topicApi = topicExplorer.api();
    var allTopicsData = topicApi.getTopicsData();

    this.myWordCloud = topicExplorer.wordCloud();
    this.myTopicPlot = topicExplorer.topicPlot()
        .wordCloud(this.myWordCloud);

    var topicData = allTopicsData[defaultNumTopics].coordinates;
    this.myTopicPlot.plotTopicData(topicData);

  }

  onButtonClick() {
    var numDesiredTopics = document.getElementById("topic-num-input").value;
    var topicApi = topicExplorer.api();
    var allTopicsData = topicApi.getTopicsData();
    var newTopicData = allTopicsData[numDesiredTopics].coordinates;
    this.myTopicPlot.plotTopicData(newTopicData);
    this.myWordCloud.clearImage();
  }


  render() {
    return (
        <div className="svg-container">
          <Row>
            <Col span={12}>
              <svg id="word-cloud" viewBox={"0 0 500 500"} preserveAspectRatio={"xMidYMid meet"} width={"50%"}></svg>
            </Col>
            <Col span={12}>
              <svg id="topic-plot" viewBox={"0 0 500 500"} preserveAspectRatio={"xMidYMid meet"} width={"50%"}></svg>
            </Col>
          </Row>
          <Row>
            <Col span={3}>
              <input type="text" placeholder={"# Desired topics"} id={"topic-num-input"}/>
              <button type={"button"} onClick={this.onButtonClick} >Calculate Topics</button>
            </Col>
          </Row>
        </div>
    )
  }
}
