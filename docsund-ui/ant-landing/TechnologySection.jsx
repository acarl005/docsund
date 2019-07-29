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
    text: "The entities and relationships extracted using spaCy are stored in a Neo4j database. Docsund's Entity Explorer is built on top of Neo4j's Browser tool.",
  },
  gensim: {
    imgUrl: require("../assets/gensim-logo.png"),
    text: "Topics are determined using a technique called Latent Dirichlet Allocation (LDA). Docsund will fit many topic models with the number of topics ranging from 3 to 35. Docsund uses the Gensim library's LDA implementation to fit these models. For each topic model, Docsund produces a \"topic distribution\", which visualizes the similarity between topics (similar topics are closer together) and prominence (larger topics are more prominent in the corpus), as well as word clouds for each topic. The Topic Distribution and word clouds are served to the users in the Topic Explorer. The Topic Explorer is built using D3.JS."
  },
  elasticsearch: {
    imgUrl: require("../assets/elasticsearch-logo.png"),
    text: 'TODO: write about Elasticsearch.',
  },
  reactjs: {
    imgUrl: require("../assets/react-logo.png"),
    text: 'TODO: write about React.',
  },
  kubernetes: {
    imgUrl: require("../assets/kubernetes-logo.png"),
    text: 'TODO: write about Kubernetes.',
  },
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
          <Menu.Item key={item.key}>
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
