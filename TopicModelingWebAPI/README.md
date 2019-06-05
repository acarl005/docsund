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

The API should be callable using Ajax calls from the website.  The API can also be tested using curl as shown below:

**Select the emails.csv to process, and indicate it is an emails file**<br>
curl -d "file=emails.csv&type=emails" http://127.0.0.1:5000/TM/SelectFile

**Determine the number of topics.  Repeatedly call GetNumberOfTopics to find out when it is done. In this case, the JSON response will be: {"complete": true, "numberOfTopics": 5}**<br>
curl -X POST http://127.0.0.1:5000/TM/FindNumberOfTopics<br>
curl http://127.0.0.1:5000/TM/GetNumberOfTopics

**Build the LDA model. Repeatedly call GetModelBuilt to find out when it is done. In this case, the JSON response will be: {"modelBuilt": true}**<br>
curl -X POST http://127.0.0.1:5000/TM/StartBuildingModel<br>
curl http://127.0.0.1:5000/TM/GetModelBuilt

**Get a word cloud for topic 0**<br>
curl -o wc.png http://127.0.0.1:5000/TM/GetWordCloudForTopic?topicId=0

**Get a visualization of the topic distribution**<br>
curl -o td.png http://127.0.0.1:5000/TM/GetTopicDistribution

**Get the documents Ids for topic 0**<br>
curl http://127.0.0.1:5000/TM/GetDocIDsForTopic?topicId=0
