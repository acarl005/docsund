# Topic Modeling Web API

## Directory Structure:


\TopicModelingWebAPI<br>
&nbsp;&nbsp;&nbsp;&nbsp;\Temp<br>
&nbsp;&nbsp;&nbsp;&nbsp;\UploadedFiles<br>
&nbsp;&nbsp;&nbsp;&nbsp;EmailHelperFunctions.py<br>
&nbsp;&nbsp;&nbsp;&nbsp;MDS.py<br>
&nbsp;&nbsp;&nbsp;&nbsp;TopicModeling.py<br>
&nbsp;&nbsp;&nbsp;&nbsp;TopicModelingAPI.py<br>

## Prerequisite:
1. Packages: flask, gensim, wordcloud
2. Download and extract Mallet: http://mallet.cs.umass.edu/dist/mallet-2.0.8.zip.  Note that Mallet requires Java.
3. Edit TopicModeling.py to set the paths for Mallet
4. Create the Temp and UploadedFiles folders
5. The emails.csv file goes in the UploadedFiles folder

## Running Flask:
set FLASK_APP=TopicModelingAPI.py

flask run


## Web API:

The API should be callable using REST calls from the website.

**List the archives**<br>
GET	/tm/archives

**Select the archive to process, and indicate its type (emails, documents)**<br>
POST	/tm/archives/\<name\>

Example:<br>
/tm/archives/emails2.csv<br>
Form data: type=emails

**Set the number of topics manually**<br>
POST	/TM/topics/\<num topics\>

**Set the stop words**<br>
POST	/TM/stopwords
Form data: stopWords=['word1','word2',...]

**Build the LDA model. Repeatedly call /tm/ldamodel to find out when it is done. In this case, the JSON response will be: {"modelBuilt": true}**<br>
GET	/tm/ldamodel<br>

**Determine the number of topics.  Repeatedly call /tm/topics to find out when it is done. In this case, the JSON response will be: {"complete": true, "numberOfTopics": 5}**<br>
GET	/tm/topics<br>

**Get a word cloud for a topic**<br>
GET	/tm/topics/\<id\>

**Get a visualization of the topic distribution**<br>
GET	/tm/topicdistribution<br>

**Get the documents Ids for a topic**<br>
GET	/tm/topics/\<id\>/documents

Example:<br>
/tm/topics/0/documents
