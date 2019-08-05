import React from "react"
import { Col, Icon } from "antd"
import TechnologySection from "./TechnologySection"
import ArchitecturePage from "./ArchitecturePage"

const iframeProps = {
  frameBorder: 0,
  style: {
    width: "100%",
    height: "100vh"
  }
}

export const Nav00DataSource = {
  wrapper: { className: "header0 home-page-wrapper" },
  page: { className: "home-page" },
  logo: {
    className: "header0-logo",
    children: require("../assets/logo.png")
  },
  Menu: {
    className: "header0-menu",
    children: [
      {
        path: "/architecture",
        display: "About",
        component: ArchitecturePage
      },
      {
        path: "/enron",
        display: "Enron Emails",
        component: () => <iframe src="http://enron.docsund.info" title="enron dataset" {...iframeProps} />
      },
      {
        path: "/clinton",
        display: "Clinton Emails",
        component: () => <iframe src="http://clinton.docsund.info" title="clinton dataset" {...iframeProps} />
      },
      {
        path: "/dnc",
        display: "DNC Emails",
        component: () => <iframe src="http://dnc.docsund.info" title="dnc dataset" {...iframeProps} />
      },
      {
        path: "/sony",
        display: "Sony Emails",
        component: () => <iframe src="http://sony.docsund.info" title="sony dataset" {...iframeProps} />
      }
    ]
  },
  mobileMenu: { className: "header0-mobile-menu" }
}
export const Banner01DataSource = {
  wrapper: { className: "banner0" },
  textWrapper: { className: "banner0-text-wrapper" },
  title: {
    className: "banner0-title",
    children: <>
      <div>Docsund</div>
      <div>An interactive application for exploring large collections of documents</div>
    </>
  },
  content: {
    className: "banner0-content",
    children: "Docsund uses modern technology to allow journalists and researchers to quickly find important stories within large collections of unstructured documents."
  },
  button: {
    onClick: (e, history) => {
      history.push("/enron")
    },
    className: "banner0-button",
    children: (
      <>
        <span>Explore Emails</span>
        <Icon type="arrow-right" />
      </>
    )
  }
}
export const Content00DataSource = {
  wrapper: { className: "home-page-wrapper content00-wrapper" },
  page: { className: "home-page content00" },
  OverPack: { playScale: 0.3, className: "" },
  titleWrapper: {
    className: "title-wrapper",
    children: [{ name: "title", children: "Our Vision" }]
  },
  block: {
    className: "block-wrapper",
    children: [
      {
        name: "block0",
        className: "block",
        children: {
          content: {
            children: (
              <>
                <div>
                  Document dumps of emails from organizations and individuals have become more common in recent years.
                  Journalists and researchers face the daunting task of sifting through these documents, often under the pressure of a short deadline.
                  An obstacle to searching these documents is that the software tools (text editors) used by these groups are not well suited for this task.
                  Rather than performing an exploration of the data, they resort to searching for key words which may be relevant.
                </div>
                <br />
                <div>
                  Docsund offers a solution for handling these types of document collections.
                  Docsund is an interactive, web based tool to allow the rapid exploration of large, unstructured document collections.
                  It provides a full search feature to quickly search for words within all the documents, and an intuitive browser for viewing results.
                  The entity browser shows the relationship between entities (people, organizations, money, and time) in the document.
                  Finally, the topic explorer automatically finds latent topics within the documents,
                  giving the user an high level overview of the documents, and also starting points for further exploration.
                </div>
              </>
            )
          }
        }
      }
    ]
  }
}
export const Content01DataSource = {
  wrapper: { className: "home-page-wrapper content01-wrapper" },
  page: { className: "home-page content01" },
  OverPack: { playScale: 0.3, className: "" },
  titleWrapper: {
    className: "title-wrapper",
    children: [{ name: "title", children: "Key Concepts" }]
  },
  block: {
    className: "block-wrapper",
    children: [
      {
        name: "block0",
        className: "block",
        children: {
          content: {
            children: (
              <>
                <Col md={12} xs={24} style={{ padding: "0 10px" }}>
                  <h3 style={{ marginBottom: 8 }}>What is an Entity?</h3>
                  An Entity is a person, place, or other named object found within text.
                  Docsund uses Named Entity Recognition techniques to automatically extract People, Places, Organizations, from the corpus.
                  Docsund also determines relationships between entities so users can learn not just the who and what, but also the connections between them.
                  Docsund organizes these entities and relationships into a network of entities and visualizes this network in its interactive Entity Explorer.
                </Col>
                <Col md={12} xs={24} style={{ padding: "0 10px" }}>
                  <h3 style={{ marginBottom: 8 }}>What is a Topic?</h3>
                  A Topic is a subject that's discussed in text.
                  In terms of language, a topic is a collection of related words that appear together more frequently in a document if that document is about that topic.
                  For example, a topic about cars may contain words like engine, wheels, or transmission.
                  <br />
                  <br />
                  Docsund uses Topic Modeling techniques to determine the topics discussed in a corpus, and visualizes these topics to the user in its interactive Topic Explorer tool.
                </Col>
              </>
            )
          }
        }
      }
    ]
  }
}
export const Content02DataSource = {
  wrapper: { className: "home-page-wrapper content02-wrapper" },
  page: { className: "home-page content00" },
  OverPack: { playScale: 0.3, className: "" },
  titleWrapper: {
    className: "title-wrapper",
    children: [{ name: "title", children: "Technology" }]
  },
  block: {
    className: "block-wrapper",
    children: [
      {
        name: "block0",
        className: "block",
        children: {
          content: {
            children: <TechnologySection />
          }
        }
      }
    ]
  }
}
export const DemosDataSource = {
  wrapper: { className: "home-page-wrapper content01-wrapper" },
  page: { className: "home-page content01" },
  OverPack: { playScale: 0.3, className: "" },
  titleWrapper: {
    className: "title-wrapper",
    children: [{ name: "title", children: "Demos" }]
  },
  block: {
    className: "block-wrapper",
    children: [
      {
        name: "block0",
        className: "block",
        children: {
          content: {
            children: <div style={{ textAlign: "center" }}>
              <Col md={8} xs={24}>
                <h4>Demo: Entity Explorer</h4>
                <div style={{ padding: "0 8px" }}>
                  <div className="vid-container">
                    <iframe
                      src="https://www.youtube.com/embed/OYIVy6CQeys"
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="entity demo"
                    />
                  </div>
                </div>
              </Col>
              <Col md={8} xs={24}>
                <h4>Demo: Search</h4>
                <div style={{ padding: "0 8px" }}>
                  <div className="vid-container">
                    <iframe
                      src="https://www.youtube.com/embed/TxZVmN-LC2M"
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="search demo"
                    />
                  </div>
                </div>
              </Col>
              <Col md={8} xs={24}>
                <h4>Demo: Topic Explorer</h4>
                <div style={{ padding: "0 8px" }}>
                  <div className="vid-container">
                    <iframe
                      src="https://www.youtube.com/embed/Id9xXILpht0"
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="topic demo"
                    />
                  </div>
                </div>
              </Col>
            </div>
          }
        }
      }
    ]
  }
}
export const Content30DataSource = {
  wrapper: { className: "home-page-wrapper content3-wrapper" },
  page: { className: "home-page content3" },
  OverPack: { playScale: 0.3 },
  titleWrapper: {
    className: "title-wrapper",
    children: [
      {
        name: "title",
        children: "Team",
        className: "title-h1"
      },
      {
        name: "content",
        className: "title-content",
        children: "Meet the engineers behind the project!"
      }
    ]
  },
  block: {
    className: "content3-block-wrapper",
    children: [
      {
        name: "block0",
        className: "content3-block",
        md: 6,
        sm: 12,
        xs: 24,
        children: {
          icon: {
            className: "content3-icon",
            children: require("../assets/ryan.jpg")
          },
          textWrapper: { className: "content3-text" },
          title: { className: "content3-title", children: "Ryan Delgado" },
          content: {
            className: "content3-content",
            children: <a href="https://www.linkedin.com/in/ryan-delgado-69544568/" target="_blank" rel="noopener noreferrer">
              <Icon type="linkedin" style={{ paddingRight: 4 }} />
              Linkedin
            </a>
          }
        }
      },
      {
        name: "block1",
        className: "content3-block",
        md: 6,
        sm: 12,
        xs: 24,
        children: {
          icon: {
            className: "content3-icon",
            children: require("../assets/danielle.jpg")
          },
          textWrapper: { className: "content3-text" },
          title: { className: "content3-title", children: "Danielle O'Neil" },
          content: {
            className: "content3-content",
            children: <a href="https://www.linkedin.com/in/danielleoneil98/" target="_blank" rel="noopener noreferrer">
              <Icon type="linkedin" style={{ paddingRight: 4 }} />
              Linkedin
            </a>
          }
        }
      },
      {
        name: "block2",
        className: "content3-block",
        md: 6,
        sm: 12,
        xs: 24,
        children: {
          icon: {
            className: "content3-icon",
            children: require("../assets/andy.jpg")
          },
          textWrapper: { className: "content3-text" },
          title: { className: "content3-title", children: "Andrew Carlson" },
          content: {
            className: "content3-content",
            children: <>
              <a href="https://www.linkedin.com/in/acarl005/" target="_blank" rel="noopener noreferrer">
                <Icon type="linkedin" style={{ paddingRight: 4 }} />
              </a>
              <a href="https://github.com/acarl005" target="_blank" rel="noopener noreferrer">
                <Icon type="github" style={{ paddingRight: 4 }} />
              </a>
              <a href="https://twitter.com/acarl005" target="_blank" rel="noopener noreferrer">
                <Icon type="twitter" style={{ paddingRight: 4 }} />
              </a>
            </>
          }
        }
      },
      {
        name: "block3",
        className: "content3-block",
        md: 6,
        sm: 12,
        xs: 24,
        children: {
          icon: {
            className: "content3-icon",
            children: require("../assets/matt.jpg")
          },
          textWrapper: { className: "content3-text" },
          title: { className: "content3-title", children: "Matthew Prout" },
          content: {
            className: "content3-content",
            children: <a href="https://www.linkedin.com/in/matthew-prout/" _target="blank" rel="noopener noreferrer">
              <Icon type="linkedin" style={{ paddingRight: 4 }} />
              Linkedin
            </a>
          }
        }
      }
    ]
  }
}
export const Footer10DataSource = {
  wrapper: { className: "home-page-wrapper footer1-wrapper" },
  OverPack: { className: "footer1", playScale: 0.2 },
  block: {
    className: "home-page",
    children: [
      {
        name: "block0",
        xs: 24,
        md: 16,
        className: "block",
        title: {
          className: "logo",
          children: <>
            <Icon type="file-text" style={{ paddingRight: "10px" }} />
            License
          </>
        },
        content: {
          className: "license",
          children: <p>
            Docsund is free software: you can redistribute it and/or modify
            it under the terms of the GNU General Public License as published by
            the Free Software Foundation, either version 3 of the License, or
            (at your option) any later version.

            This program is distributed in the hope that it will be useful,
            but WITHOUT ANY WARRANTY; without even the implied warranty of
            MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
            GNU General Public License for more details.

            For more details, see <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">here</a>.
          </p>
        }
      },
      {
        name: "block0",
        xs: 24,
        md: 8,
        className: "block",
        title: {
          className: "logo",
          children: <>
            <Icon type="database" style={{ paddingRight: "10px" }} />
            Datasets
          </>
        },
        content: {
          className: "license",
          children: <ul>
            <li><a href="https://www.kaggle.com/wcukierski/enron-email-dataset">Enron Emails</a></li>
            <li><a href="https://www.kaggle.com/kaggle/hillary-clinton-emails">Hillary Clinton Emails</a></li>
            <li><a href="https://wikileaks.org//sony/emails/">Sony Emails</a></li>
            <li><a href="https://wikileaks.org//dnc-emails/">DNC Emails</a></li>
          </ul>
        }
      }
    ]
  },
  copyrightWrapper: { className: "copyright-wrapper" },
  copyrightPage: { className: "home-page" },
  copyright: {
    className: "copyright",
    children: <>
      <p>
        ©2019 by Team Docsund all rights reserved. Created for the final Capstone Project.
      </p>
    </>
  }
}
