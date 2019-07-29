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
    imgUrl: '',
    text: 'Docsund uses spaCy to extract Entities from the documents. spaCy is a Python library for common NLP tasks like tokenization & preprocessing, Part-of-Speech tagging, and Named Entity Recognition (NER). spaCy uses a pre-trained machine learning model to extract entities from documents.'
  },
  neo4j: {
    imgUrl: '',
    text: "The entities and relationships extracted using spaCy are stored in a Neo4j database. Docsund's Entity Explorer is built on top of Neo4j's Browser tool.",
  },
  gensim: {
    imgUrl: '',
    text: "Topics are determined using a technique called Latent Dirichlet Allocation (LDA). Docsund will fit many topic models with the number of topics ranging from 3 to 35. Docsund uses the Gensim library's LDA implementation to fit these models. For each topic model, Docsund produces a \"topic distribution\", which visualizes the similarity between topics (similar topics are closer together) and prominence (larger topics are more prominent in the corpus), as well as word clouds for each topic. The Topic Distribution and word clouds are served to the users in the Topic Explorer. The Topic Explorer is built using D3.JS."
  },
  elasticsearch: {
    imgUrl: '',
    text: 'The Search functionality is built on ElasticSearch. The documents are ingested into an ElasticSearch server',
  },
  reactjs: {
    imgUrl: '',
    text: '',
  },
  kubernetes: {
    imgUrl: '',
    text: '',
  },
}

export function TechnologySection() {
  const [selectedKey, setSelectedKey] = useState('spacy')
  return (
    <>
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
      <Col span={18}>
        <p>{CONTENT[selectedKey].text}</p>
      </Col>
    </>
  )
}
