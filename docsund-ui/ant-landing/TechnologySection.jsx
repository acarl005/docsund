import React, { useState } from 'react'
import { Col, Menu } from 'antd'

const MENU_ITEMS = [
  {key: 'spacy', label: 'spaCy'},
  {key: 'neo4j', label: 'Neo4j'},
  {key: 'gensim', label: 'Gensim'},
  {key: 'elasticsearch', label: 'Elasticsearch'},
  {key: 'reactjs', label: 'ReactJS'},
  {key: 'kubernetes', label: 'Kubernetes'},
]

const CONTENT = {
  spacy: {
    imgUrl: require("../assets/spacy-logo.png"),
    text: 'Docsund uses spaCy to extract Entities from the documents. spaCy is a Python library for common NLP tasks like tokenization & preprocessing, Part-of-Speech tagging, and Named Entity Recognition (NER). spaCy uses a pre-trained machine learning model to extract entities from documents.'
  },
  neo4j: {
    imgUrl: require("../assets/neo4j-logo.png"),
    text: "The entities and relationships extracted using spaCy are stored in a Neo4j database. Its graph data model makes it ideal for Docsund's entity graph. It also has plugins for algorithms like PageRank to help us find important entities. Docsund's entity explorer component is forked from the official, open-source Neo4j web client."
  },
  gensim: {
    imgUrl: require("../assets/gensim-logo.png"),
    text: "Topics are determined using a technique called Latent Dirichlet Allocation (LDA). Docsund will fit many topic models with the number of topics ranging from 3 to 35. Docsund uses the Gensim library's LDA implementation to fit these models. For each topic model, Docsund produces a \"topic distribution\", which visualizes the similarity between topics (similar topics are closer together) and prominence (larger topics are more prominent in the corpus), as well as word clouds for each topic. The Topic Distribution and word clouds are served to the users in the Topic Explorer. The Topic Explorer is built using D3.JS."
  },
  elasticsearch: {
    imgUrl: require("../assets/elasticsearch-logo.png"),
    text: "Elasticsearch powers the email search feature. Answering unstructured queries in sub-second response times is a crucial part of the exploration experience. Elasticsearch's design allows it to search millions of documents quickly and effectively.",
  },
  reactjs: {
    imgUrl: require("../assets/react-logo.png"),
    text: "React is Facebook's JavaScript library for building dynamic user interfaces with a reactive functional programming paradigm. It allows us to build fast, reponsive web pages for seamless data exploration.",
  },
  kubernetes: {
    imgUrl: require("../assets/kubernetes-logo.png"),
    text: ["Docsund's compute cluster is deployed via Kubernetes. Each of the individual jobs and services are containerized with Docker. This not only streamlines the deployment for us, it facilitates the distribution of the software to users so that they can easily host it on their own cluster. See intructions for deploying your own Docsund cluster ", <a href="https://github.com/acarl005/docsund/blob/master/infra/README.md" target="_blank">here.</a>],
  },
}

const selectedStyle = {
  borderRight: '3px solid #1890ff',
  background: '#e6f7ff',
  color: '#1890ff',
}

export function TechnologySection() {
  const [selectedKey, setSelectedKey] = useState('spacy')
  return <>
    <Col span={6}>
      <Menu
        selectedKeys={[selectedKey]}
        onSelect={({ key }) => setSelectedKey(key)}
      >
        {MENU_ITEMS.map((item) => (
          <Menu.Item
            key={item.key}
            style={item.key === selectedKey ? selectedStyle : {}}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </Col>
    <Col span={18} style={{ padding: "20px" }}>
      <img src={CONTENT[selectedKey].imgUrl} alt={`${selectedKey} logo`} style={{ height: "60px", marginBottom: "30px" }} />
      <p>{CONTENT[selectedKey].text}</p>
    </Col>
  </>
}
