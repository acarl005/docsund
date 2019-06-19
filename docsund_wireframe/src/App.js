import React, { Component } from 'react';
import { Tabs, Row, Col, Menu, Icon, Input, List } from 'antd';
import './App.css';
import TopicModelingComponent from "./TopicModelingComponent.js"

const { TabPane } = Tabs;

function callback(key) {
    console.log(key);
}
const { page } = "page";
const { menu } = "menu";
const { searchinput } = "searchinput";
const { searchresults } = "searchresults";
const { explorer } = "explorer";

const data = [
    'Search Result 1',
    'Search Result 2',
    'Search Result 3',
    'Search Result 4',
    'Search Result 5',
];

class App extends Component {
  render() {
    return (
        <div id={ page }>

            <div id={ menu }>
                <Menu
                    mode="horizontal"
                    defaultSelectedKeys={['3']}
                    style={{ lineHeight: '64px', marginBottom: '64px' }}
                >
                    <Menu.Item key="1">Home</Menu.Item>
                    <Menu.Item key="2">About</Menu.Item>
                    <Menu.Item key="3">Enron Emails</Menu.Item>
                    <Menu.Item key="4">Sony Emails</Menu.Item>
                </Menu>
            </div>

            <Row>
                <Col span={18} offset={3}>
                    <div id={ searchinput } style={{marginBottom: '16px'}}>
                        <Input addonAfter={<Icon type="search" />} placeholder="Type a search query against the emails..." />
                    </div>
                </Col>
            </Row>

            <Row>
                <Col span={18} offset={3}>
                    <div id={ searchresults } style={{marginBottom: '64px'}}>
                        <List
                            bordered
                            dataSource={data}
                            renderItem={item => (
                                <List.Item>
                                    {item}
                                </List.Item>
                            )}
                        />
                    </div>
                </Col>
            </Row>

            <Row>
                <Col span={18} offset={3}>
                    <div id={ explorer }>
                        <Tabs onChange={ callback } style={{height: '600px', width: '1265px', border: '1px solid grey', borderRadius: '10px'}} type="card">
                            <TabPane tab="Entity Explorer" key="1">
                                <img src={ require("./images/entity_graph.PNG") } alt=""/>
                            </TabPane>
                            <TabPane tab="Topic Explorer" key="2">
                                <TopicModelingComponent/>
                            </TabPane>
                            <TabPane tab="Money Explorer" key="3">
                                <img src={ require("./images/dollarsign.jpg") } alt=""/>
                            </TabPane>
                            <TabPane tab="Communication Explorer" key="4">
                                Hey.
                            </TabPane>
                        </Tabs>
                    </div>
                </Col>
            </Row>

        </div>
    );
  }
}

export default App;
