import React from 'react'
import { Avatar, Col, Icon, Menu } from 'antd'
import { TechnologySection } from './TechnologySection'

export const Nav00DataSource = {
  wrapper: { className: 'header0 home-page-wrapper' },
  page: { className: 'home-page' },
  logo: {
    className: 'header0-logo',
    children: require('../assets/logo.png'),
  },
  Menu: {
    className: 'header0-menu',
    children: [
      { name: 'item0', a: { children: 'Home', href: '' } },
      { name: 'item1', a: { children: 'Enron Emails', href: '' } },
      { name: 'item2', a: { children: 'Sony Emails', href: '' } },
      { name: 'item3', a: { children: 'DNC Emails', href: '' } },
      { name: 'item4', a: { children: 'Clinton Emails', href: '' } },
    ],
  },
  mobileMenu: { className: 'header0-mobile-menu' },
};
export const Banner01DataSource = {
  wrapper: { className: 'banner0' },
  textWrapper: { className: 'banner0-text-wrapper' },
  title: {
    className: 'banner0-title',
    children: (
      <>
        <div>Docsund</div>
        <div>An interactive application for exploring large collections of documents</div>
      </>

    ),
  },
  content: {
    className: 'banner0-content',
    children: 'Docsund uses modern technology to allow journalists and researchers to quickly find important stories within large collections of unstructured documents.',
  },
  button: {
    onClick: () => {
      const a = document.createElement('a')
      a.href = 'http://enron.docsund.info'
      a.target = 'blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    className: 'banner0-button',
    children: (
      <>
        <span>Explore Emails</span>
        <Icon type='arrow-right' />
      </>
    )
  },
};
export const Content00DataSource = {
  wrapper: { className: 'home-page-wrapper content00-wrapper' },
  page: { className: 'home-page content00' },
  OverPack: { playScale: 0.3, className: '' },
  titleWrapper: {
    className: 'title-wrapper',
    children: [{ name: 'title', children: 'Our Vision' }],
  },
  block: {
    className: 'block-wrapper',
    children: [
      {
        name: 'block0',
        className: 'block',
        children: {
          content: {
            children: (
              <>
                <div>Document dumps of emails from organizations and individuals have become more common in recent years. Journalists and researchers face the daunting task of sifting through these documents, often under the pressure of a short deadline. An obstacle to searching these documents is that the software tools (text editors) used by these groups are not well suited for this task. Rather than performing an exploration of the data, they resort to searching for key words which may be relevant.</div>
                <br />
                <div>Docsund offers a solution for handling these types of document collections. Docsund is an interactive, web based tool to allow the rapid exploration of large, unstructured document collections. It provides a full search feature to quickly search for words within all the documents, and an intuitive browser for viewing results. The entity browser shows the relationship between entities (people, organizations, money, and time) in the document. Finally, the topic explorer automatically finds latent topics within the documents, giving the user an high level overview of the documents, and also starting points for further exploration.</div>
              </>
            )
          },
        },
      },
    ],
  },
};
export const Content01DataSource = {
  wrapper: { className: 'home-page-wrapper content01-wrapper' },
  page: { className: 'home-page content01' },
  OverPack: { playScale: 0.3, className: '' },
  titleWrapper: {
    className: 'title-wrapper',
    children: [{ name: 'title', children: 'Key Concepts' }],
  },
  block: {
    className: 'block-wrapper',
    children: [
      {
        name: 'block0',
        className: 'block',
        children: {
          content: {
            children: (
              <>
                <Col md={12} xs={24} style={{ padding: "0 10px" }}>
                  <h3 style={{marginBottom: 8}}>What is an Entity?</h3>
                  An Entity is a person, place, or other named object found within text. Docsund uses Named Entity Recognition techniques to automatically extract People, Places, Organizations, from the corpus. Docsund also determines relationships between entities so users can learn not just the who and what, but also the connections between them. Docsund organizes these entities and relationships into a network of entities and visualizes this network in its interactive Entity Explorer.
                </Col>
                <Col md={12} xs={24} style={{ padding: "0 10px" }}>
                  <h3 style={{marginBottom: 8}}>What is a Topic?</h3>
                  A Topic is a subject that's discussed in text. In terms of language, a topic is a collection of related words that appear together more frequently in a document if that document is about that topic. For example, a topic about cars may contain words like engine, wheels, or transmission.
                  <br />
                  <br />
                  Docsund uses Topic Modeling techniques to determine the topics discussed in a corpus, and visualizes these topics to the user in its interactive Topic Explorer tool.
                </Col>
              </>
            )
          },
        },
      },
    ],
  },
};
export const Content02DataSource = {
  wrapper: { className: 'home-page-wrapper content00-wrapper' },
  page: { className: 'home-page content00' },
  OverPack: { playScale: 0.3, className: '' },
  titleWrapper: {
    className: 'title-wrapper',
    children: [{ name: 'title', children: 'Technology' }],
  },
  block: {
    className: 'block-wrapper',
    children: [
      {
        name: 'block0',
        className: 'block',
        children: {
          content: {
            children: <TechnologySection />
          },
        },
      },
    ],
  },
};
export const DemosDataSource = {
  wrapper: { className: 'home-page-wrapper content01-wrapper' },
  page: { className: 'home-page content01' },
  OverPack: { playScale: 0.3, className: '' },
  titleWrapper: {
    className: 'title-wrapper',
    children: [{ name: 'title', children: 'Demos' }],
  },
  block: {
    className: 'block-wrapper',
    children: [
      {
        name: 'block0',
        className: 'block',
        children: {
          content: {
            children: <div style={{ textAlign: "center" }}>
              <Col md={8} xs={24}>
                <h4>Demo: Search</h4>
                <iframe src="https://www.youtube.com/embed/bxi0sfYbXAs" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </Col>
              <Col md={8} xs={24}>
                <h4>Demo: Entity Explorer</h4>
                <iframe src="https://www.youtube.com/embed/bxi0sfYbXAs" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </Col>
              <Col md={8} xs={24}>
                <h4>Demo: Topic Explorer</h4>
                <iframe src="https://www.youtube.com/embed/bxi0sfYbXAs" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </Col>
            </div>
          },
        },
      },
    ],
  },
};
export const Content30DataSource = {
  wrapper: { className: 'home-page-wrapper content3-wrapper' },
  page: { className: 'home-page content3' },
  OverPack: { playScale: 0.3 },
  titleWrapper: {
    className: 'title-wrapper',
    children: [
      {
        name: 'title',
        children: 'Team',
        className: 'title-h1',
      },
      {
        name: 'content',
        className: 'title-content',
        children: 'Meet the engineers behind the project!',
      },
    ],
  },
  block: {
    className: 'content3-block-wrapper',
    children: [
      {
        name: 'block0',
        className: 'content3-block',
        md: 6,
        xs: 24,
        children: {
          icon: {
            className: 'content3-icon',
            children: require('../landing/images/ryan.jpg'),
          },
          textWrapper: { className: 'content3-text' },
          title: { className: 'content3-title', children: 'Ryan Delgado' },
          content: {
            className: 'content3-content',
            children: <a href='https://www.linkedin.com/in/ryan-delgado-69544568/' target='_blank'>
              <Icon type='linkedin' style={{paddingRight: 4}}/>
              Linkedin
            </a>
          },
        },
      },
      {
        name: 'block1',
        className: 'content3-block',
        md: 6,
        xs: 24,
        children: {
          icon: {
            className: 'content3-icon',
            children: require('../landing/images/danielle.jpg'),
          },
          textWrapper: { className: 'content3-text' },
          title: { className: 'content3-title', children: "Danielle O'Neil" },
          content: {
            className: 'content3-content',
            children: <a href='https://www.linkedin.com/in/danielleoneil98/' target='_blank'>
              <Icon type='linkedin' style={{paddingRight: 4}}/>
              Linkedin
            </a>
          },
        },
      },
      {
        name: 'block2',
        className: 'content3-block',
        md: 6,
        xs: 24,
        children: {
          icon: {
            className: 'content3-icon',
            children: require('../landing/images/andy.jpg'),
          },
          textWrapper: { className: 'content3-text' },
          title: { className: 'content3-title', children: 'Andrew Carlson' },
          content: {
            className: 'content3-content',
            children: <>
              <a href='https://www.linkedin.com/in/acarl005/' target='_blank'>
                <Icon type='linkedin' style={{paddingRight: 4}}/>
              </a>
              <a href='https://github.com/acarl005' target='_blank'>
                <Icon type='github' style={{paddingRight: 4}}/>
              </a>
              <a href='https://twitter.com/acarl005' target='_blank'>
                <Icon type='twitter' style={{paddingRight: 4}}/>
              </a>
            </>
          },
        },
      },
      {
        name: 'block3',
        className: 'content3-block',
        md: 6,
        xs: 24,
        children: {
          icon: {
            className: 'content3-icon',
            children: require('../landing/images/matt.jpg'),
          },
          textWrapper: { className: 'content3-text' },
          title: { className: 'content3-title', children: 'Matthew Prout' },
          content: {
            className: 'content3-content',
            children: <a href='https://www.linkedin.com/in/matthew-prout-732871/' _target='blank'>
              <Icon type='linkedin' style={{paddingRight: 4}}/>
              Linkedin
            </a>
          },
        },
      },
    ],
  },
};
export const Footer10DataSource = {
  wrapper: { className: 'home-page-wrapper footer1-wrapper' },
  OverPack: { className: 'footer1', playScale: 0.2 },
  block: {
    className: 'home-page',
    children: [
      {
        name: 'block0',
        xs: 24,
        md: 6,
        className: 'block',
        title: {
          className: 'logo',
          children:
            'https://zos.alipayobjects.com/rmsportal/qqaimmXZVSwAhpL.svg',
        },
        content: {
          className: 'slogan',
          children: 'Animation specification and components of Ant Design.',
        },
      },
      {
        name: 'block1',
        xs: 24,
        md: 6,
        className: 'block',
        title: { children: '产品' },
        content: {
          children: (
            <>
              <p>
                {' '}
                <a href="#">产品更新记录</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">API文档</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">快速入门</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">参考指南</a>{' '}
              </p>
            </>
          ),
        },
      },
      {
        name: 'block2',
        xs: 24,
        md: 6,
        className: 'block',
        title: { children: '关于' },
        content: {
          children: (
            <>
              <p>
                {' '}
                <a href="#">FAQ</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">联系我们</a>{' '}
              </p>
            </>
          ),
        },
      },
      {
        name: 'block3',
        xs: 24,
        md: 6,
        className: 'block',
        title: { children: '资源' },
        content: {
          children: (
            <>
              <p>
                {' '}
                <a href="#">Ant Design</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">Ant Design</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">Ant Design</a>{' '}
              </p>{' '}
              <p>
                {' '}
                <a href="#">Ant Design</a>{' '}
              </p>
            </>
          ),
        },
      },
    ],
  },
  copyrightWrapper: { className: 'copyright-wrapper' },
  copyrightPage: { className: 'home-page' },
  copyright: {
    className: 'copyright',
    children: (
      <>
        <span>
          ©2018 by <a href="https://motion.ant.design">Ant Motion</a> All Rights
          Reserved
        </span>
      </>
    ),
  },
};
