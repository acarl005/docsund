import React from "react"
import { Col } from "antd"

export default function () {
  return (
    <>
      <div className="home-page-wrapper content00-wrapper architecture">
        <div className="home-page content00">
          <div className="title-wrapper">
            <h1 name="title">Entity Extraction</h1>
          </div>
          <div className="">
            <div className="ant-row block-wrapper">
              <div name="block0" className="ant-col block">
                <Col lg={8} xs={24}>
                  <p>
                    A named entity is a “real-world object” that is assigned a name - people, countries, products, movie titles, and monetary amounts are all examples of named entities.
                    When sifting through large document caches, the ability to identify entities of specific types is key to understanding what people are discussing in their emails.
                  </p>
                  <p>
                    After receiving the data, Docsund uses spaCy, a Python library tailored to natural language processing, to identify and extract entities.
                    spaCy’s default model is extremely fast, and has an accuracy of around ~80-85%.
                    For certain common entity types that could be prone to misspellings and name variations—such as persons, organizations,
                    and facilities—we can apply Levenshtein distance to link entities that were mentioned in disparate emails by different people and resolve them to refer to the same parent entity.
                  </p>
                  <p>
                    The result of this process is what you see in our Entity Explorer: in addition to having the ability to see who is emailing whom and at what approximate volume,
                    we can also see what entities these people are discussing most often.
                  </p>
                </Col>
                <Col lg={16} xs={24}>
                  <img src={require("../assets/entities_etl.png")} alt="entities etl diagram" />
                </Col>
              </div>
            </div>
          </div>
        </div>
        <div className="home-page content00">
          <div className="title-wrapper">
            <h1 name="title">Search</h1>
          </div>
          <div className="">
            <div className="ant-row block-wrapper">
              <div name="block0" className="ant-col block">
                <Col lg={8} xs={24}>
                  <ul>
                    <li>
                      <strong>Importing data:</strong>
                      {" "}
                      Email data files are provided by the user that follows the defined schema. A script converts the CSV file into a JSON file.
                      LogStash then imports the JSON file into ElasticSearch.
                    </li>
                    <li>
                      <strong>Performing a search:</strong>
                      {" "}
                      The user enters their search term into the web page, and a script formats it into a Query DSL format query.
                      The script then makes a REST request to ElasticSearch.
                      ElasticSearch processes the request and returns the search results.
                      The script then takes the results and writes them to the web page.
                    </li>
                  </ul>
                </Col>
                <Col lg={16} xs={24}>
                  <img src={require("../assets/search_diagram.png")} alt="search diagram" />
                </Col>
              </div>
            </div>
          </div>
        </div>
        <div className="home-page content00">
          <div className="title-wrapper">
            <h1 name="title">Topic Modeling</h1>
          </div>
          <div className="">
            <div className="ant-row block-wrapper">
              <div name="block0" className="ant-col block">
                <Col lg={8} xs={24}>
                  <ul>
                    <li>
                      <strong>Creating the topic data:</strong>
                      {" "}
                      Topic data is created by first loading the email corpus csv file, taking a sample of emails from this corpus, and preprocessing them to clean them for the algorithm.
                      Models of different topic sizes are then created using the latent Dirichlet allocation (LDA) algorithm using the Gensim library,
                      and the topic distribution and word clouds for the topics are saved to a JSON file.
                      Once all the models have been calculated, the optimum number of topics is calculated using the MALLET library, which is used as a default for the user.
                    </li>
                    <li>
                      <strong>Web service:</strong>
                      {" "}
                      The topic modeling web service is implemented using Flask to make the topic modeling data available using REST calls.
                      Data is returned from the endpoints using JSON and base64 (for image data), as these formats are easily consumed by web page.
                      The Flask API is a thin wrapper that delegates to the Python implementation called TopicModeling2.
                      This lightweight class loads the topic modeling data file into a dictionary that allows the data to be easily and quickly accessed.
                    </li>
                  </ul>
                </Col>
                <Col lg={16} xs={24}>
                  <img src={require("../assets/topic_data_creation.png")} alt="topic modeling diagram" />
                </Col>
              </div>
            </div>
          </div>
        </div>
        <div className="home-page content00">
          <div className="title-wrapper">
            <h1 name="title">React UI</h1>
          </div>
          <div className="">
            <div className="ant-row block-wrapper">
              <div name="block0" className="ant-col block">
                <Col lg={8} xs={24}>
                  <p>
                    The results of the whole pipeline are served via two Flask microservices.
                    The APIs are consumed by the browser, which is running D3.js and React.
                    Each of these backend processes have React components dedicated to making their insights convivial to the user.
                  </p>
                </Col>
                <Col lg={16} xs={24}>
                  <img src={require("../assets/react_ui.png")} alt="react ui" />
                </Col>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
