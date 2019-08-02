import os
import logging
import numpy as np 
import pandas as pd
import datetime
import matplotlib.pyplot as plt
import threading
from enum import IntEnum
import base64
import json

from MDS import cmdscale
from CreateModelingThread import DocumentTypeEnum, createModelThread, min_topic_size, max_topic_size

import gensim

from wordcloud import WordCloud

logging.basicConfig(format="%(asctime)s - %(levelname)s:%(message)s", level=logging.INFO)

# Number of words to include in word cloud
number_of_topic_words = 30


class CreateTopicData:
    def __init__(self):
        self.documentType = DocumentTypeEnum.emailType		# TODO: Email processing by default
        self.sub_df = None
        self.dictionary = None
        self.text_term_matrix = None
        self.text_clean = []
        self.optimum_text_clean = []
        self.numberOfTopics = 0
        self.ldamodel = None
        self.createModelThread_ = None
        self.manuallySetNumTopics = False
        self.userStopList = None
        self.topic_data = {}

    def initialize(self):
        print('initialize')

        # Determine the number of topics to calculate
        current_topic_size = 0

        # Load the topic data file if it exists
        if os.path.isfile('./state/TopicData/topic_data.json'):
            with open('./state/TopicData/topic_data.json', 'r') as f:
                self.topic_data = json.load(f)

            # Get current model data
            if 'models' in self.topic_data:
                model_data = self.topic_data['models']
            else:
                model_data = {}

            # Find the model in the topic data file, and add one for the next model to create
            current_topic_size = np.max(list(map(lambda x: int(x), model_data.keys()))) + 1

        #----------------------------------------
        #with open('start.txt', 'w') as f:
        #    f.write(str(datetime.datetime.now()))
        #----------------------------------------

        # Create topic data
        if self.createTopics(current_topic_size):

            # Find optimal number of topics to use if the topic size changed
            self.findOptimalNumberOfTopics()

        #----------------------------------------
        #with open('complete.txt', 'w') as f:
        #    f.write(str(datetime.datetime.now()))
        #----------------------------------------

        print('All topics built')

    def createTopics(self, current_topic_size):
        print('createTopics')

        # Get current model data to build upon
        if 'models' in self.topic_data:
            model_data = self.topic_data['models']
        else:
            model_data = {}

        topics_changed = False

        while current_topic_size <= max_topic_size:
            if current_topic_size == 0:
                current_topic_size = min_topic_size

            print('Creating topic: ', current_topic_size)

            self.numberOfTopics = current_topic_size
            self.createModelThread_ = createModelThread(self)
            self.createModelThread_.start()
            self.createModelThread_.join()

            #
            # Determine scaled Jensen-Shannon distances
            #
            x_values, y_values, marker_area = self.getScaledJensenShannonDistance()

            # Fill out the topic distribution information and word clouds
            data = {}
            for i in range(len(x_values)):
                data[str(i)] = {'x': x_values[i], 'y': y_values[i], 'size': marker_area[i], 'wordcloud': self.createWordCloudForTopic(i)[1]}

            model_data[str(current_topic_size)] = data
            self.topic_data['models'] = model_data

            print('Saving topic_data.json')

            with open('./state/TopicData/topic_data.json', 'w') as f:
                json.dump(self.topic_data, f)

            topics_changed = True
            current_topic_size += 1

        return topics_changed

    def findOptimalNumberOfTopics(self):
        print('findOptimalNumberOfTopics')

        self.numberOfTopics = -1
        self.createModelThread_ = createModelThread(self)
        self.createModelThread_.start()
        self.createModelThread_.join()

        self.topic_data['optimalnumber'] = self.numberOfTopics

        print('Saving topic_data.json')

        with open('./state/TopicData/topic_data.json', 'w') as f:
            json.dump(self.topic_data, f)

    def createWordCloudForTopic(self, topicNumber):
        print('createWordCloudForTopic: {}'.format(topicNumber))

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, ''

        word_frequencies = self.ldamodel.show_topic(topicNumber, number_of_topic_words)

        # Generate a word cloud image
        wordFreqDict = dict(word_frequencies)
        wordcloud = WordCloud(width=600, height=600).fit_words(wordFreqDict)
        wordcloud.background_color = 'white'

        fig = plt.figure(figsize=(6,6))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis("off")

        # Save the image to a temp folder to be sent by Flask
        filePath = os.path.join('./state/Temp', 'wordcloud.png')
        plt.savefig(filePath)
        plt.close(fig)

        # Return file as a base64 encoded string
        with open(filePath, 'rb') as f:
            image_read = f.read()

        return True, base64.encodestring(image_read).decode("utf-8")

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

def main():
    ctd = CreateTopicData()
    ctd.initialize()

if __name__ == "__main__":
    main()

