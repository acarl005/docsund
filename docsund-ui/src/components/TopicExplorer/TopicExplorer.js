import React, {Component} from 'react';
import {Row, Col, Button, Typography} from 'antd';
import './TopicExplorer.css';
import 'antd/dist/antd.css';
import {select} from 'd3-selection';
import {topicExplorer} from './topic-explorer';

const { Text } = Typography;

export default class TopicExplorer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      docIDs: []
    };

    this.onMoreTopics = this.onMoreTopics.bind(this);
    this.onLessTopics = this.onLessTopics.bind(this);
    this.onDisplayTopicDocuments = this.onDisplayTopicDocuments.bind(this);
  }

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
      var currentTopicSpan = document.getElementById("current-topic");
      currentTopicSpan.textContent = "NONE SELECTED";
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
      var currentTopicSpan = document.getElementById("current-topic");
      currentTopicSpan.textContent = "NONE SELECTED";
      console.log("Less topics.");
    }
  }

  async onDisplayTopicDocuments () {
    const currentTopicNumber = document.getElementById('current-topic');

    // From the perspective of the user, topics range from 1 to #topics
    const chosenTopicNumber = parseInt(currentTopicNumber.textContent, 10);
    // console.log(chosenTopicNumber);

    var TOPIC_API_URL = "http://127.0.0.1:5000";
    const data = await fetch(TOPIC_API_URL + '/TM/topics/' + chosenTopicNumber.toString() + '/documents', {
      mode: 'cors',
      method: 'GET'
    }).then((resp) => resp.json());

    const documentIDArray = data.docIDs;
    console.log(documentIDArray);

    this.setState({docIDs: documentIDArray});
    await appStore.fetchEmailsFromIDs(documentIDArray, 100);
    appStore.toggleModal('topicSample');
    appStore.setEmailModalView('list')
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
              <Button type="primary" onClick={this.onLessTopics}>Less Topics</Button>
            </Col>
            <Col span={3}>
              <Button type="primary" onClick={this.onMoreTopics}>More Topics</Button>
            </Col>
            <Col span={3}>
              <Button type="primary" onClick={this.onDisplayTopicDocuments}>View Topic Emails</Button>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Text> Displaying <span id={"num-topics"}>10</span> topics. </Text>
            </Col>
            <Col span={6}>
              <Text> Displaying word cloud for topic <span id={"current-topic"}>NONE SELECTED</span></Text>
            </Col>
          </Row>

        </div>
    )
  }
}