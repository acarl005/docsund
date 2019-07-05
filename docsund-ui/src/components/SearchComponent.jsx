import React from "react";

// Set the URL to ElasticSearch
var elastic_search_url = 'http://localhost:9200/';


class SearchComponent extends React.Component {

    //
    // Constructor
    //
    constructor(props) {
        super(props);

        // TODO
    }

    componentDidMount() {
    }

    //
    // Performs a full-text query using ElasticSearch
    //
    searchFn() {

        var searchText = document.getElementById("searchText").value;
        var searchResults = document.getElementById("results");

        //
        // Clear the search results
        //
        while (searchResults.firstChild) {
            searchResults.removeChild(searchResults.firstChild);
        }

        //
        // Full-text query with 10 results
        //
        var query = {
            "query": {
                "query_string": {
                    "query": searchText
                }
            },
            "size": 10
        };

        var url = elastic_search_url + '_search';

        fetch(url, {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query)
        })
        .then((resp) => resp.json())
        .then(function (resp) {

            if (resp.hits.hits.length == 0) {
                var listValue = document.createTextNode("No search results found");
                var listItem = document.createElement("li");
                listItem.appendChild(listValue);
                searchResults.appendChild(listItem);
            } else {

                //
                // Iterate over the search results
                //
                for (var hit in resp.hits.hits) {

                    var listItem = document.createElement("li");

                    var hitInfo = resp.hits.hits[hit];

                    //
                    // Display the index field
                    //
                    var divElement1 = document.createElement('div');
                    divElement1.id = 'indexValue';
                    listItem.appendChild(divElement1);
                    var span1 = document.createElement('span');
                    span1.className = "messageField";
                    span1.innerHTML = "Index: ";
                    divElement1.appendChild(span1);
                    var listValue1 = document.createTextNode(hitInfo._source['id']);
                    divElement1.appendChild(listValue1);

                    //
                    // Display the To field
                    //
                    var divElement2 = document.createElement('div');
                    divElement2.id = 'toValue';
                    listItem.appendChild(divElement2);

                    var span2 = document.createElement('span');
                    span2.className = "messageField";
                    span2.innerHTML = "To: ";
                    divElement2.appendChild(span2);
                    var listValue2 = document.createTextNode(hitInfo._source['to']);
                    divElement2.appendChild(listValue2);

                    //
                    // Display the From field
                    //
                    var divElement3 = document.createElement('div');
                    divElement3.id = 'fromValue';
                    listItem.appendChild(divElement3);

                    var span3 = document.createElement('span');
                    span3.className = "messageField";
                    span3.innerHTML = "From: ";
                    divElement3.appendChild(span3);
                    var listValue3 = document.createTextNode(hitInfo._source['from']);
                    divElement3.appendChild(listValue3);

                    //
                    // Display the Subject field
                    //
                    var divElement4 = document.createElement('div');
                    divElement4.id = 'subjectValue';
                    listItem.appendChild(divElement4);

                    var span4 = document.createElement('span');
                    span4.className = "messageField";
                    span4.innerHTML = "Subject: ";
                    divElement4.appendChild(span4);
                    var listValue4 = document.createTextNode(hitInfo._source['subject']);
                    divElement4.appendChild(listValue4);

                    //
                    // Display the Date field
                    //
                    var divElement5 = document.createElement('div');
                    divElement5.id = 'dateValue';
                    listItem.appendChild(divElement5);

                    var span5 = document.createElement('span');
                    span5.className = "messageField";
                    span5.innerHTML = "Date: ";
                    divElement5.appendChild(span5);
                    var listValue5 = document.createTextNode(hitInfo._source['date']);
                    divElement5.appendChild(listValue5);

                    //
                    // Display the body of the document
                    //
                    var divElement6 = document.createElement('div');
                    divElement6.id = 'bodyValue';
                    listItem.appendChild(divElement6);

                    var span6 = document.createElement('span');
                    span6.className = "messageField";
                    span6.innerHTML = "Body: ";
                    divElement6.appendChild(span6);
                    //highlightText(divElement3, hitInfo._source['body'], searchText);

                    var bodyText = hitInfo._source['body'];

                    if (bodyText.length > 250) {
                        bodyText = bodyText.substring(0,250);
                        bodyText += "...";
                    }

                    var listValue6 = document.createTextNode(bodyText);
                    divElement6.appendChild(listValue6);

                    searchResults.appendChild(listItem);
                }
            }
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    }

    //
    // Renders the HTML content
    //
    render() {
        return (
    <div id="SearchPane">
    <input type="text" id="searchText"></input>
    <button id="searchBtn" onClick={this.searchFn}>Search</button>
    <br />
    <ul id="results"></ul>
    </div>
        );
    }
}

export default SearchComponent;
