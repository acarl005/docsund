// Set the URL to ElasticSearch
test_url = 'http://localhost:9200/';


//
// Highlights the search text in the documents returned by the search
//
function highlightText(element, text, searchText) {

    var searchTextLen = searchText.length;
    var remainingBuffer = text;

    while (remainingBuffer.length > 0) {

        var index = remainingBuffer.toLowerCase().search(searchText.toLowerCase());

        //
        // No more matching text, so just display the rest of the document
        //
        if (index == -1) {
            var remainingTextNode = document.createTextNode(remainingBuffer);
            element.appendChild(remainingTextNode);
            break;
        }

        //
        // Display the text prior to the matching text
        //
        if (index > 0) {
            var startTextNode = document.createTextNode(remainingBuffer.substr(0, index));
            element.appendChild(startTextNode);
        }

        //
        // Display the matching text using 'mark' to highlight the text
        //
        var highlightNode = document.createElement('mark');
        highlightNode.innerText = remainingBuffer.substr(index, searchTextLen);
        element.appendChild(highlightNode);

        remainingBuffer = remainingBuffer.substr(index + searchTextLen);
    }
}

//
// Performs a full-text query using ElasticSearch
//
searchFn = function () {

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

    var url = test_url + '_search';

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

        var listItem = document.createElement("li");

        if (resp.hits.hits.length == 0) {
            var listValue = document.createTextNode("No search results found");
            listItem.appendChild(listValue);
            searchResults.appendChild(listItem);
        } else {

            //
            // Iterate over the search results
            //
            for (hit in resp.hits.hits) {

                var hitInfo = resp.hits.hits[hit];

                //
                // Display the index
                //
                var divElement1 = document.createElement('div');
                divElement1.id = 'indexValue';
                listItem.appendChild(divElement1);
                var listValue1 = document.createTextNode("Index: " + hitInfo._source['Id']);
                divElement1.appendChild(listValue1);

                //
                // Display the text of the document
                //
                var divElement2 = document.createElement('div');
                divElement2.id = 'messageValue';
                listItem.appendChild(divElement2);
                highlightText(divElement2, hitInfo._source['Message'], searchText);

                searchResults.appendChild(listItem);
            }
        }
    })
    .catch(function (error) {
        console.log(JSON.stringify(error));
    });
};
