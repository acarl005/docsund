import os
import logging
import numpy as np 
import pandas as pd
import datetime
import random
import base64
import json
import matplotlib.pyplot as plt

from CreateModelingThread import DocumentTypeEnum, createModelThread
from MDS import cmdscale

import gensim

from wordcloud import WordCloud

logging.basicConfig(format="%(asctime)s - %(levelname)s:%(message)s", level=logging.INFO)

# Set the random seed for reproducability
random.seed(1)

# Number of words to include in word cloud
number_of_topic_words = 30

class TopicModeling:
    def __init__(self):
        self.documentType = DocumentTypeEnum.emailType		# TODO: Email processing by default
        self.sub_df = None
        self.dictionary = None
        self.text_term_matrix = None
        self.text_clean = []
        self.optimum_text_clean = []
        self.numberOfTopics = 0
        self.ldamodel = None
        self.modelBuilt = False
        self.createModelThread_ = None
        self.manuallySetNumTopics = False
        self.userStopList = None

    def startBuildingModel(self):
        print('startBuildingModel')

        if self.modelBuilding():
            return False

        if not self.manuallySetNumTopics:
            self.numberOfTopics = 0

        self.modelBuilt = False

        self.createModelThread_ = createModelThread(self)
        self.createModelThread_.start()

        return True

    def getNumberOfTopics(self):
        print('getNumberOfToipcs')

        if not self.modelBuilt:
            return False, 0

        return True, self.numberOfTopics

    def setNumberOfTopics(self, numTopics):
        print('setNumberOfTopics')

        if numTopics > 0:
            self.manuallySetNumTopics = True
            self.numberOfTopics = numTopics
        else:
            self.manuallySetNumTopics = False

        return True

    def setUserStopList(self, userStopList):
        print('setUserStopList')

        if len(userStopList) > 0:
            self.userStopList = userStopList.split()
        else:
            self.userStopList = None

        return True

    def modelBuilding(self):
        print('modelBuilding')

        return ((self.createModelThread_ != None) and (self.createModelThread_.isAlive()))

    def getModelBuilt(self):
        print('getModelBuilt')

        if (self.modelBuilding()):
            return False
        else:
            # Reset to None
            self.createModelThread_ = None

        return self.modelBuilt

    def getWordCloudForTopic(self, topicNumber):
        print('getWordCloudForTopic: {}'.format(topicNumber))

        if not self.modelBuilt:
            return False, ''

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, ''

        word_frequencies = self.ldamodel.show_topic(topicNumber, number_of_topic_words)

        # Generate a word cloud image
        wordFreqDict = dict(word_frequencies)
        wordcloud = WordCloud().fit_words(wordFreqDict)
        wordcloud.background_color = 'white'

        fig = plt.figure(figsize=(10,8))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis("off")

        # Save the image to a temp folder to be sent by Flask
        filePath = os.path.join('./state/Temp', 'wordcloud.png')
        plt.savefig(filePath)
        plt.close(fig)

        # Return file as a base64 encoded string
        with open(filePath, 'rb') as f:
            image_read = f.read()

        return True, base64.encodestring(image_read)

    def getCachedWordCloud(self, topicNumber):
        # TODO: read from a cached file
        return (self.getWordCloudForTopic(topicNumber)[1]).decode("utf-8")

    def getWordsForTopic(self, topicNumber):
        print('getWordsForTopic: {}'.format(topicNumber))

        if not self.modelBuilt:
            return False, ''

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, ''

        word_probabilities = self.ldamodel.show_topic(topicNumber, number_of_topic_words)

        data = [{'word': word_pair[0], 'probability': str(word_pair[1])} for word_pair in word_probabilities]
 
        return True, json.dumps(data)

    def getScaledJensenShannonDistance(self):
        print('getScaledJensenShannonDistance')

        #
        # Determine Jensen-Shannon distances
        #

        # Get the term-topic matrix learned during inference
        topics = self.ldamodel.get_topics()

        # Fill in the distance matrix with the Jensen-Shannon distances
        distance_matrix = np.zeros(shape=(len(topics), len(topics)))

        for row in range(1,len(topics)):
            for col in range(0, row):
                distance_matrix[row,col] = gensim.matutils.jensen_shannon(topics[row], topics[col])

        # Make the matrix symmetric
        distance_matrix = np.maximum(distance_matrix, distance_matrix.T)

        #
        # Get the MDS for the distance matrix
        #
        Y,e = cmdscale(distance_matrix)

        return Y[:,0], -Y[:,1], [ proportion for proportion in self.token_count_proportions]

    def getTopicDistribution(self):
        print('getTopicDistribution')

        if not self.modelBuilt:
            return False, ''

        #
        # Determine scaled Jensen-Shannon distances
        #
        x_values, y_values, marker_area = self.getScaledJensenShannonDistance()

        fig = plt.figure(figsize=(10,8))
        plt.axhline(0, color='gray', alpha=0.5)
        plt.axvline(0, color='gray', alpha=0.5)

        # Marker sizes are based on points, and also note that the radius goes up by the n^0.5 of the value for the marker
        marker_sizes = [area*(100*500) for area in marker_area]

        plt.scatter(x_values, y_values, s=marker_sizes, alpha=0.5, edgecolors='black')

        for i in range(len(x_values)):
            plt.text(x_values[i], y_values[i], str(i+1), fontsize=9)

        # Save the image to a temp folder to be sent by Flask
        filePath = os.path.join('./state/Temp', 'topicdistribution.png')
        plt.savefig(filePath)
        plt.close(fig)

        # Return file as a base64 encoded string
        with open(filePath, 'rb') as f:
            image_read = f.read()

        return True, base64.encodestring(image_read)

    def getTopicDistributionData(self):
        print('getTopicDistributionData')

        if not self.modelBuilt:
            return False, ''

        #
        # Determine scaled Jensen-Shannon distances
        #
        x_values, y_values, marker_area = self.getScaledJensenShannonDistance()

        data = {}
        for i in range(len(x_values)):
            data[i] = {'size': marker_area[i], 'topic': i, 'wordcloud': self.getCachedWordCloud(i), 'x': x_values[i], 'y': y_values[i]}

        return True, json.dumps(data)

    def getDocIDsForTopic(self, topicNumber):
        print('getDocIDsForTopic')

        if not self.modelBuilt:
            return False, []

        # Filter by topic
        messageIDs = self.sub_df[self.sub_df['topic'] == topicNumber]

        if self.documentType == DocumentTypeEnum.emailType:
            return True, messageIDs['id'].tolist()
        else:
            # TODO: return some sort of index for regular documents
            return True, []

class TopicModeling2:
    def __init__(self):
        self.documentType = DocumentTypeEnum.emailType		# TODO: Email processing by default
        self.optimalNumberOfTopics = 0
        self.topic_data = {}
        self.dataLoaded = False

        # Load the topic data file if it exists
        if os.path.isfile('./state/TopicData/topic_data.json'):
            with open('./state/TopicData/topic_data.json', 'r') as f:
                self.topic_data = json.load(f)
        else:
            print('Failed to open topic_data.json')
            return

        # Set the number of topics to the optimum number by default
        self.optimalNumberOfTopics = int(self.topic_data['optimalnumber'])
        self.dataLoaded = True

    def startBuildingModel(self):
        print('startBuildingModel')
        return False

    def getNumberOfTopics(self):
        print('getNumberOfToipcs')

        if not self.dataLoaded:
            return False, 0

        return True, self.optimalNumberOfTopics

    def setNumberOfTopics(self, numTopics):
        print('setNumberOfTopics')
        return False

    def setUserStopList(self, userStopList):
        print('setUserStopList')
        return False

    def modelBuilding(self):
        print('modelBuilding')
        return False

    def getModelBuilt(self):
        print('getModelBuilt')
        return False

    def getWordCloudForTopic(self, numTopics, topicNumber):
        print('getWordCloudForTopic: {0}, {1}'.format(numTopics, topicNumber))

        if not self.dataLoaded:
            return False, ''

        if (topicNumber < 0) or (topicNumber >= numTopics):
            return False, ''

        # Get the models dictionary
        model_dict = self.topic_data['models']

        # Get the dictionary for topics found for the model built with
        # 'numberOfTopics'
        topics_dict = model_dict[str(numTopics)]

        # Get the dictionary for the chosen topic in this model
        chosen_topic_dict = topics_dict[str(topicNumber)]

        return True, chosen_topic_dict['wordcloud']

    def getWordsForTopic(self, topicNumber):
        print('getWordsForTopic: {}'.format(topicNumber))
        return False, ''

    def getTopicDistribution(self):
        print('getTopicDistribution')
        return False, ''

    def getTopicDistributionData(self, numTopics):
        print('getTopicDistributionData: {}'.format(numTopics))

        if not self.dataLoaded:
            return False, ''

        # Get the models dictionary
        model_dict = self.topic_data['models']

        # Get the dictionary for topics found for the model built with
        # 'numTopics'
        topics_dict = model_dict[str(numTopics)]

        # Output the data
        data = {}
        for topic_id in topics_dict.keys():
            data[topic_id] = {'size': topics_dict[topic_id]['size'], 'topic': topic_id, 'wordcloud': topics_dict[topic_id]['wordcloud'], 'x': topics_dict[topic_id]['x'], 'y': topics_dict[topic_id]['y']}

        return True, data

    def getDocIDsForTopic(self, numTopics, topicNumber):
        print('getDocIDsForTopic: {0}, {1}'.format(numTopics, topicNumber))

        if not self.dataLoaded:
            return False, []

        # Load the data set to read document IDs
        sub_df = pd.read_csv('./state/TopicData/topic_{0}.csv'.format(numTopics))

        # Filter by topic
        messageIDs = sub_df[sub_df['topic'] == topicNumber]

        if self.documentType == DocumentTypeEnum.emailType:
            return True, messageIDs['id'].tolist()
        else:
            # TODO: return some sort of index for regular documents
            return True, []
