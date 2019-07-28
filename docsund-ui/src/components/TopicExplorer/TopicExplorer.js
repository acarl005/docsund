import React, {Component} from 'react';
import {Row, Col, Button, Typography} from 'antd';
import './TopicExplorer.css';
import 'antd/dist/antd.css';
import {select} from 'd3-selection';
import {topicExplorer} from './topic-explorer';

const { Text } = Typography;

export default class TopicExplorer extends Component {

  componentDidMount() {
    const defaultNumTopics = 10;
    var topicData = topicExplorer.getTopicsData(defaultNumTopics);

    topicExplorer.createWordCloud();
    topicExplorer.plotTopicData(topicData);
    topicExplorer.plotWordCloud();
  }


  onMoreTopics() {
    var maxTopicNum = topicExplorer.getMaxNumTopics();
    var numTopicsSpan = document.getElementById("num-topics");
    var currentNumTopics = parseInt(numTopicsSpan.textContent, 10);
    if (currentNumTopics === maxTopicNum) {
      console.log("Nope not going above the max.");
    } else {
      var numDesiredTopics = currentNumTopics + 1;
      numTopicsSpan.textContent = numDesiredTopics;
      var topicData = topicExplorer.getTopicsData(numDesiredTopics);
      topicExplorer.plotWordCloud();
      topicExplorer.plotTopicData(topicData);
      console.log("More topics.");
    }
  }


  onLessTopics() {
    var minTopicNum = 3;
    var numTopicsSpan = document.getElementById("num-topics");
    var currentNumTopics = parseInt(numTopicsSpan.textContent, 10);
    if (currentNumTopics === minTopicNum) {
      console.log("Nope not going below the min.");
    } else {
      var numDesiredTopics = currentNumTopics - 1;
      numTopicsSpan.textContent = numDesiredTopics;
      var topicData = topicExplorer.getTopicsData(numDesiredTopics);
      topicExplorer.plotWordCloud();
      topicExplorer.plotTopicData(topicData);
      console.log("Less topics.");
    }
  }


  render() {
    return (
        <div className="svg-container" id="topic-explorer">
          <Row>
            <Col span={12}>
              <svg id="word-cloud" viewBox={"0 0 500 500"} preserveAspectRatio={"xMidYMid meet"} width={"100%"}></svg>
            </Col>
            <Col span={12}>
              <svg id="topic-plot" viewBox={"0 0 500 500"} preserveAspectRatio={"xMidYMid meet"} width={"100%"}></svg>
            </Col>
          </Row>
          <Row>
            <Col span={3}>
              {/*<input type="text" placeholder={"# Desired topics"} id={"topic-num-input"}/>*/}
              {/*<button type={"button"} onClick={this.onButtonClick} >Calculate Topics</button>*/}
              <Button type="primary" onClick={this.onLessTopics}>Less Topics</Button>
            </Col>
            <Col span={3}>
              <Button type="primary" onClick={this.onMoreTopics}>More Topics</Button>
            </Col>

            <Col span={6}>
              {/*<style fontSize={12}>*/}
                <Text> Displaying <span id={"num-topics"}>10</span> topics. </Text>
              {/*</style>*/}
            </Col>
          </Row>
        </div>
    )
  }
}