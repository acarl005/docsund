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
    var topicApi = topicExplorer.api();
    var topicData = topicApi.getTopicsData(defaultNumTopics).coordinates;
    // console.log(topicData);

    topicExplorer.createWordCloud();
    // topicExplorer.createTopicPlot();
    topicExplorer.plotTopicData(topicData);
    topicExplorer.plotWordCloud();
  }

  fetchTopicData(numTopics) {
    var topicApi = topicExplorer.api();
    return topicApi.getTopicsData(numTopics).coordinates;
  }

  drawTopicExplorer() {
    // Create the div to house the topic explorer

    // Fit initial topic model with 10 topics & 20 top words


    // this.myWordCloud = topicExplorer.wordCloud();
    // this.myTopicPlot = topicExplorer.topicPlot()
    //     .wordCloud(this.myWordCloud);
    //
    // console.log(this.allTopicsData);
    // var topicData = this.allTopicsData[defaultNumTopics].coordinates;
    // this.myTopicPlot.plotTopicData(topicData);

  }

  onButtonClick() {
    // console.log("Button clicked!");
    var numDesiredTopics = document.getElementById("topic-num-input").value;
    // console.log(numDesiredTopics);
    var topicApi = topicExplorer.api();
    var topicData = topicApi.getTopicsData(numDesiredTopics).coordinates;
    topicExplorer.plotWordCloud();
    topicExplorer.plotTopicData(topicData);
    // var newTopicData = fetchTopicData(numTopics);
    // topicExplorer.plotTopicData(newTopicData);
    // this.myTopicPlot.plotTopicData(newTopicData);
    // this.myWordCloud.clearImage();
  }

  onMoreTopics() {
    var maxTopicNum = 20;
    var numTopicsSpan = document.getElementById("num-topics");
    var currentNumTopics = parseInt(numTopicsSpan.textContent, 10);
    if (currentNumTopics === maxTopicNum) {
      console.log("Nope not going above the max.");
    } else {
      var numDesiredTopics = currentNumTopics + 1;
      numTopicsSpan.textContent = numDesiredTopics;
      var topicApi = topicExplorer.api();
      var topicData = topicApi.getTopicsData(numDesiredTopics).coordinates;
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
      var topicApi = topicExplorer.api();
      var topicData = topicApi.getTopicsData(numDesiredTopics).coordinates;
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
                <Text level={4}> Displaying <span id={"num-topics"}>10</span> topics. </Text>
              {/*</style>*/}
            </Col>
          </Row>
        </div>
    )
  }
}