import React from "react";
import appStore from "../stores/AppStore"


function createNode(element) {
    return document.createElement(element);
};

function append(parent, el) {
    return parent.appendChild(el);
};


class TopicModelingComponent extends React.Component {

    //
    // Constructor
    //
    constructor(props) {
        super(props);

        this.timerId = null;

        this.state = {
            modelBuilding: false,                           // whether the model is building
            modelCreated: false,                            // whether the model has been created
            stopWords: "please\nthanks\nwould\nect\nhou",
            docIDs: []
        };

        this.clearOutputForNewModelFn = this.clearOutputForNewModelFn.bind(this);
        this.checkIfModelBuiltFn = this.checkIfModelBuiltFn.bind(this);
        this.createModelFn = this.createModelFn.bind(this);
        this.getNumTopicsFn = this.getNumTopicsFn.bind(this);
        this.getWordCloudFn = this.getWordCloudFn.bind(this);
        this.getTopicDistributionFn = this.getTopicDistributionFn.bind(this);
        this.getDocumentIDsFn = this.getDocumentIDsFn.bind(this);
    }

    componentDidMount() {
    }

    //
    // Clear controls which show results for the current model
    //
    clearOutputForNewModelFn() {
        var numTopicsText = document.getElementById('numTopicsText');
        numTopicsText.innerHTML = 0;

        var wcImage = document.getElementById('wordCloudImg');
        wcImage.src = "";

        var wcImage = document.getElementById('topicDistributionImg');
        wcImage.src = "";

        this.setState({docIDs: []});
    }

    //
    // Checks if the model has been built, and if so, sets the 'modelCreated' state
    //
    checkIfModelBuiltFn () {

        fetch(TOPIC_API_URL + '/TM/ldamodel', {
            mode: 'cors',
            method: 'GET'
        })
        .then((resp) => resp.json())
        .then((data) => {

            this.setState( { modelBuilding: data['modelBuilding'] } );
            this.setState( { modelCreated: data['modelBuilt'] } );

            if (data['modelBuilt']) {
                clearInterval(this.timerId);
            }
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    }

    //
    // Does the following:
    //  o Sets the number of topics
    //  o Sets the stop words
    //  o Starts building the model
    //
    createModelFn () {
        // Clear output
        this.clearOutputForNewModelFn();

        // Number of topics
        var setNumTopicsChkBx = document.getElementById("setNumTopicsChkBx");
        var url = TOPIC_API_URL + '/TM/topics/';

        if (setNumTopicsChkBx.checked) {
            var numTopicsText = document.getElementById("setNumTopicsText");
            url += numTopicsText.value;
        } else {
            url += '0';     // automatically determine the number of topics
        }

        fetch(url, {
            mode: 'cors',
            method: 'POST'
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
            return;
        });

        // Stop words
        var setStopWordsChkBx = document.getElementById("setStopWordsChkBx");
        var stopWords = '';

        if (setStopWordsChkBx.checked) {
            var re = /[a-zA-Z]+/g;
            var m;
            while (m = re.exec(this.state.stopWords)) {
                stopWords += m[0];
                stopWords += ' ';
            }
        }

        var formData = new FormData();
        formData.append('stopWords', stopWords);

        fetch(TOPIC_API_URL + '/TM/stopwords', {
            mode: 'cors',
            method: 'POST',
            body: formData
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
            return;
        });

        // Start building the model
        fetch(TOPIC_API_URL + '/TM/ldamodel', {
            mode: 'cors',
            method: 'POST'
        })
        .then(() => {
            this.timerId = setInterval(this.checkIfModelBuiltFn, 1000);
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    }

    //
    // Sets the input field to the server's value for the number of topics to find
    //
    getNumTopicsFn () {
        fetch(TOPIC_API_URL + '/TM/topics', {
            mode: 'cors',
            method: 'GET'
        })
        .then((resp) => resp.json())
        .then(function (resp) {
            var numTopicsText = document.getElementById('numTopicsText');
            numTopicsText.innerHTML = resp['numberOfTopics'];
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    }

    //
    // Requests a word cloud for a particular topic and sets the word cloud
    // control with the data for this image.
    //
    getWordCloudFn () {
        var chosenTopicIDText = document.getElementById('chosenTopicIDText');

        // From the perspective of the user, topics range from 1 to #topics
        var chosenTopicNumber = parseInt(chosenTopicIDText.value, 10);
        chosenTopicNumber -= 1;

        fetch(TOPIC_API_URL + '/TM/topics/' + chosenTopicNumber.toString(), {
            mode: 'cors',
            method: 'GET'
        })
        .then((resp) => resp.text())
        .then(function (data) {
            var wcImage = document.getElementById('wordCloudImg');
            wcImage.src = "data:image/png;charset=utf-8;base64," + data;
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    }

    //
    // Requests the topic distribution and sets the appropriate control with
    // the data for this image.
    //
    getTopicDistributionFn () {
        fetch(TOPIC_API_URL + '/TM/topicdistribution', {
            mode: 'cors',
            method: 'GET'
        })
        .then((resp) => resp.text())
        .then(function (data) {
            var wcImage = document.getElementById('topicDistributionImg');
            wcImage.src = "data:image/png;charset=utf-8;base64," + data;
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    }

    //
    // Returns the document IDs associated with a particular topic, and displays them
    // in a text box control.
    //
    async getDocumentIDsFn () {
        const topicIDForDocumentsText = document.getElementById('topicIDForDocumentsText');

        // From the perspective of the user, topics range from 1 to #topics
        const chosenTopicNumber = parseInt(topicIDForDocumentsText.value, 10) - 1;

        const data = await fetch(TOPIC_API_URL + '/TM/topics/' + chosenTopicNumber.toString() + '/documents', {
            mode: 'cors',
            method: 'GET'
        }).then((resp) => resp.json())

        const documentIDsText = document.getElementById('documentIDsText');
        const documentIDArray = data.docIDs;

        this.setState({docIDs: documentIDArray});
        await appStore.fetchEmailsFromIDs(documentIDArray, 100)
        appStore.toggleModal('topicSample')
        appStore.setEmailModalView('list')
    }

    //
    // Store the stop words in the state per the React architecture
    //
    handleStopWordChange(e) {
        this.setState( {stopWords: e.target.value});
    }

    //
    // Renders the HTML content
    //
    render() {
        return (
    <div id="TopicModelingPane">
        <div id="TopicModelingControlBox">
            <p>Press 'Create Model' to create the LDA model:</p>
            <input type="checkbox" id="setNumTopicsChkBx" />Specify Number of Topics:
            <br/>
            <input type="text" id="setNumTopicsText" defaultValue="0"/>
            <br/>
            <input type="checkbox" id="setStopWordsChkBx" />Specify Stop Words:
            <br/>
            <textarea id="stopWordsText" rows="5" cols="20" value={this.state.stopWords} onChange={this.handleStopWordChange.bind(this)}>
            </textarea>
            <br/>
            <button id="createModelBtn" disabled={this.state.modelBuilding} onClick={this.createModelFn}>Create Model</button>
            <br/>
        </div>
        <p>Press 'Get Number of Topics' to get the number of topics that were found:</p>
        <button id="getNumberOfTopicsBtn" disabled={!this.state.modelCreated} onClick={this.getNumTopicsFn}>Get Number of Topics</button>
        <p id="numTopicsText">0</p>
        <p>Press 'Get Topic Distribution' to get the topic distribution:</p>
        <button id="getTopicDistributionBtn" disabled={!this.state.modelCreated} onClick={this.getTopicDistributionFn}>Get Topic Distribution</button>
        <br />
        <img id="topicDistributionImg" src="" width="800" height="500" />
        <br />
        <p>Enter a topic number (1-#topics) and press 'Get Word Cloud' to get the word cloud:</p>
        <button id="getWordCloudBtn" disabled={!this.state.modelCreated} onClick={this.getWordCloudFn}>Get Word Cloud</button>
        <input type="text" id="chosenTopicIDText" size="10"/>
        <br />
        <img id="wordCloudImg" src="" width="800" height="500"/>
        <br />
        <p>Enter a topic number (1-#topics) and press 'Get Document IDs' to get a list of document IDs:</p>
        <button id="getDocumentIDsBtn" disabled={!this.state.modelCreated} onClick={this.getDocumentIDsFn}>Get Documents</button>
        <input type="text" id="topicIDForDocumentsText" size="10"/>
        <br />
        <textarea id="documentIDsText" rows="10" cols="50" value={this.state.docIDs} readOnly></textarea>
    </div>
        );
    }
}

export default TopicModelingComponent;
