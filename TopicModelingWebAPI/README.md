# Topic Modeling Web API

## Directory Structure:


\TopicModelingWebAPI<br>
&nbsp;&nbsp;&nbsp;&nbsp;\Temp<br>
&nbsp;&nbsp;&nbsp;&nbsp;EmailHelperFunctions.py<br>
&nbsp;&nbsp;&nbsp;&nbsp;MDS.py<br>
&nbsp;&nbsp;&nbsp;&nbsp;TopicModeling.py<br>
&nbsp;&nbsp;&nbsp;&nbsp;TopicModelingAPI.py<br>

## Prerequisite:
1. Packages: flask, gensim, wordcloud, neo4j
2. Download and extract Mallet: http://mallet.cs.umass.edu/dist/mallet-2.0.8.zip.  Note that Mallet requires Java.
3. Edit TopicModeling.py to set the paths for Mallet
4. Create the Temp folder
5. Download NLTK stopwords and wordnet if necessary:

import nltk<br>
nltk.download('stopwords')<br>
nltk.download('wordnet')<br>

## Running Flask:

Windows:<br>
set FLASK_APP=TopicModelingAPI.py<br>
flask run<br>

Linux:<br>
FLASK_APP=TopicModelingAPI.py flask run<br>

## Web API:

The API should be callable using REST calls from the website.

**Set the number of topics manually**<br>
POST	/TM/topics/\<num topics\>

**Set the stop words**<br>
POST	/TM/stopwords
Form data: stopWords=['word1','word2',...]

**Build the LDA model. In this case, the JSON response will be: {"modelBuilding": true, "modelBuilt": false}**<br>
POST	/tm/ldamodel<br>

**Get the LDA model status. Repeatedly call /tm/ldamodel to find out when it is done. In this case, the JSON response will be: {"modelBuilding": true/false, "modelBuilt": true/false}**<br>
GET	/tm/ldamodel<br>

**Determine the number of topics.  Repeatedly call /tm/topics to find out when it is done. In this case, the JSON response will be: {"complete": true, "numberOfTopics": 5}**<br>
GET	/tm/topics<br>

**Get a word cloud for a topic**<br>
GET	/tm/topics/\<id\>

**Get a visualization of the topic distribution. Returns an image.**<br>
GET	/tm/topicdistribution<br>

**Get a visualization of the topic distribution data. Returns a JSON array of data points representing the topic distribution.**<br>
GET	/tm/topicdistributiondata<br>

**Get the documents Ids for a topic**<br>
GET	/tm/topics/\<id\>/documents

Example:<br>
/tm/topics/0/documents
