import os, sys, email, re
import logging
import numpy as np 
import pandas as pd
import datetime
import random
import matplotlib.pyplot as plt
import threading
import time
from enum import IntEnum
import base64
import json
from collections import Counter

from EmailHelperFunctions import get_text_from_email, split_email_addresses, clean_email
from MDS import cmdscale

import gensim
from gensim import corpora
from gensim.models import CoherenceModel

from wordcloud import WordCloud

from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer

logging.basicConfig(format="%(asctime)s - %(levelname)s:%(message)s", level=logging.INFO)

# Set the random seed for reproducability
random.seed(1)

# TODO: Set the sample sizes
optimum_sample_size = 1000
sample_size         = 15000

# Min and max number of topics
min_topic_size = 3
max_topic_size = 35

# Number of words to include in word cloud
number_of_topic_words = 30

# Download File: http://mallet.cs.umass.edu/dist/mallet-2.0.8.zip
# Mallet is Java based, so make sure Java is installed

# Set the paths to Mallet
mallet_distribution = os.environ["MALLET_HOME"]
mallet_binary = os.path.join(mallet_distribution, 'bin', 'mallet')

class DocumentTypeEnum(IntEnum):
    unknownType = 0
    emailType = 1           # 'emails'
    documentType = 2        # 'documents'

class createModelThread(threading.Thread):
    def __init__(self, tmo):
        threading.Thread.__init__(self)
        self.tm = tmo
        self.mallet_path = ''

    def run(self):
        print('Starting createModelThread: {}'.format(datetime.datetime.now()))

        #
        # These functions should set the following lists of strings:
        #       self.tm.text_clean
        #       self.tm.optimum_text_clean
        #
        if self.tm.documentType == DocumentTypeEnum.emailType:
            self.process_emails()
        elif self.tm.documentType == DocumentTypeEnum.documentType:
            self.process_documents()
        else:
            print('Error in createModelThread, document type not specified')
            return False

        # Create the dictionary for the model
        self.tm.dictionary = corpora.Dictionary(self.tm.optimum_text_clean)

        # Create the text_term_matrix
        self.tm.text_term_matrix = [self.tm.dictionary.doc2bow(text) for text in self.tm.optimum_text_clean]

        #
        # Automatically determine the number of topics if required
        #
        if self.tm.numberOfTopics <= 0:

            # Compute optimial number of topics only
            optimalTopicsOnly = False

            if self.tm.numberOfTopics == -1:
                optimalTopicsOnly = True

            # Set paths needed by Mallet
            os.environ.update({'MALLET_HOME': mallet_distribution})
            self.mallet_path = mallet_binary

            # Compute the coherence values using Mallet
            model_list, coherence_values = self.compute_coherence_values(dictionary=self.tm.dictionary,\
                                                                         corpus=self.tm.text_term_matrix,\
                                                                         texts=self.tm.optimum_text_clean,\
                                                                         limit=max_topic_size,\
                                                                         start=5,step=5)

            # Find the optimal number of topics
            limit = max_topic_size
            start = 5
            step = 5
            x = list(range(start, limit, step))
            self.tm.numberOfTopics = x[np.argmax(coherence_values)]
            print('Optimum number of topics is: {}'.format(self.tm.numberOfTopics))

            if optimalTopicsOnly:
                return True

        # Create the dictionary and term matrix used by LDA
        self.tm.dictionary = corpora.Dictionary(self.tm.text_clean)
        self.tm.text_term_matrix = [self.tm.dictionary.doc2bow(text) for text in self.tm.text_clean]

        # Buid the Gensim LDA model
        Lda = gensim.models.ldamodel.LdaModel

        self.tm.ldamodel = Lda(self.tm.text_term_matrix, num_topics=self.tm.numberOfTopics, id2word = self.tm.dictionary, passes=30)

        #
        # Get token count proportion statistics for the plot.  Also add topic
        # category to sub_df
        #
        topic_token_count = [0 for i in range(0,self.tm.numberOfTopics)]
        topicSeries = []

        # Note: Must use len(text_clean) because len(text_clean) <= sample_size because some documents may have been removed (e.g. were HTML)
        for i in range(0,len(self.tm.text_clean)):
            assignedTopic = self.assigned_topic(self.get_candidate_topics(i))
            topic_token_count[assignedTopic] += len(self.tm.text_term_matrix[i])
            topicSeries.append(assignedTopic)

        self.tm.token_count_proportions = np.array(topic_token_count) / sum(topic_token_count)
        self.tm.sub_df['topic'] = topicSeries

        # Write the data frame (with topic assignment) to disk so it can be read when the user switches the number of topics
        self.tm.sub_df.to_csv('./TopicData/topic_{0}.csv'.format(self.tm.numberOfTopics), index=False)

        self.tm.modelBuilt = True

        print('Finished createModelThread: {}'.format(datetime.datetime.now()))
        return True

    def createStopWordList(self, df):

        stop_words_path = './TopicData/stopwords.json'

        # Read stop words from a file if it already exists
        if os.path.isfile(stop_words_path):
            with open(stop_words_path, 'r') as f:
                return json.load(f)

        # Get word count vector
        cv = CountVectorizer(min_df = 0.01, max_df = 1.0)
        word_count_vector = cv.fit_transform(df.content)
        feature_names = cv.get_feature_names()

        # Calculate TF-IDF weights for words in documents
        tfidf_transformer = TfidfTransformer(smooth_idf=True, use_idf=True)
        transformed_weights = tfidf_transformer.fit_transform(word_count_vector)

        # Create a count of least informative words from each document
        counter = Counter()

        def findLeastInformativeWordAndUpdateCounter(row):
            cols = row.nonzero()[1]
            vals = row.toarray().ravel()[cols].tolist()
            if len(vals) > 0:
                counter[cols[np.argmin(vals)]] += 1

        # Find least least informative word for each document
        for row in transformed_weights:
            findLeastInformativeWordAndUpdateCounter(row)

        # Now find the words (from the indicies)
        most_common_indicies = [x[0] for x in counter.most_common()]
        common_words = [feature_names[idx] for idx in most_common_indicies]

        # Remove English stop words
        final_list = []
        for word in common_words:
            if word not in set(stopwords.words('english')):
                final_list.append(word)

        final_list = final_list[:20]
        print('The stop words are: ', final_list)

        # Write to a file so it does not need to be computed each time
        with open(stop_words_path, 'w') as f:
            json.dump(final_list, f)

        return final_list

    def process_emails(self):
        global sample_size
        global optimum_sample_size

        # Load the entire email corpus
        emails_df = pd.read_csv('email_data.csv')
        emails_df.columns = ['ID', 'To', 'From', 'Subject', 'Body', 'Date']

        # Adjust the sample size if necessary
        if sample_size > len(emails_df):

            # In case the hard coded sample size is greater than the number of
            # emails, then just use the number of emails
            sample_size = len(emails_df)

            # Use 10% of the sample size when determining the optimal number of
            # topics
            optimum_sample_size = round(sample_size * 0.1)

        # Sample emails from entire csv
        emails_df = emails_df.sample(n=sample_size)

        # Convert columns to the correct type
        emails_df['ID'] = pd.to_numeric(emails_df['ID'])
        emails_df['Date'] = emails_df['Date'].apply(lambda x: pd.to_datetime(str(x)))

        # Parse the emails into a list email objects
        messages = list(map(email.message_from_string, emails_df['Body']))

        # Parse content from emails
        emails_df['content'] = list(map(get_text_from_email, messages))
        del messages
        emails_df = emails_df.drop(['Body'], axis=1)

        # Remove emails that are HTML
        emails_df = emails_df[(emails_df['content'].str.lower()).str.find("<head>") == -1]

        self.tm.sub_df = emails_df

        # Create stop words
        stopWords = self.createStopWordList(emails_df)

        # Set the text_clean to be used to create the LDA model
        self.tm.text_clean = []
        for text in self.tm.sub_df['content']:
            self.tm.text_clean.append(clean_email(text, stopWords).split())

        # Use a smaller sample to find the coherence values in
        # compute_coherence_values()
        self.tm.optimum_text_clean = [
            self.tm.text_clean[i] for i in random.sample(range(len(self.tm.text_clean)), optimum_sample_size)
        ]

    def process_documents(self):
        # TODO
        self.tm.text_clean = []
        self.tm.optimum_text_clean = []

    def compute_coherence_values(self, dictionary, corpus, texts, limit, start=2, step=3):
        """
        Compute c_v coherence for various number of topics

        Args:
            dictionary : Gensim dictionary
            corpus : Gensim corpus
            texts : List of input texts
            limit : Max num of topics

        Returns:
            model_list : List of LDA topic models
            coherence_values : Coherence values corresponding to the LDA model with respective number of topics

        Raises:
            None
        """
        coherence_values = []
        model_list = []
        for num_topics in range(start, limit, step):
            model = gensim.models.wrappers.LdaMallet(self.mallet_path, corpus=corpus, num_topics=num_topics, id2word=dictionary)
            model_list.append(model)
            coherencemodel = CoherenceModel(model=model, texts=texts, dictionary=dictionary, coherence='c_v')
            coherence_values.append(coherencemodel.get_coherence())

        return model_list, coherence_values

    def assigned_topic(self, candidateTopics):
        largest = (0,0.0)
        for topic in candidateTopics:
            if topic[1] > largest[1]:
                largest = topic
        return largest[0]

    def get_candidate_topics(self, index):
        return self.tm.ldamodel.get_document_topics(self.tm.text_term_matrix[index])

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
        filePath = os.path.join('./Temp', 'wordcloud.png')
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
        filePath = os.path.join('./Temp', 'topicdistribution.png')
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
            return True, messageIDs['ID'].tolist()
        else:
            # TODO: return some sort of index for regular documents
            return True, []

class TopicModeling2:
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
        self.topic_data = {}
        self.topicsBuilt = False

        # Determine the number of topics to calculate
        current_topic_size = 0

        # Load the topic data file if it exists
        if os.path.isfile('./TopicData/topic_data.json'):
            with open('./TopicData/topic_data.json', 'r') as f:
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
        else:

            # Set the number of topics to the optimum number by default
            self.numberOfTopics = int(self.topic_data['optimalnumber'])

        #----------------------------------------
        #with open('complete.txt', 'w') as f:
        #    f.write(str(datetime.datetime.now()))
        #----------------------------------------

        print('All topics built')
        self.topicsBuilt = True

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

            with open('./TopicData/topic_data.json', 'w') as f:
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

        with open('./TopicData/topic_data.json', 'w') as f:
            json.dump(self.topic_data, f)

    def startBuildingModel(self):
        print('startBuildingModel')

        if not self.topicsBuilt:
            return False

        return True

    def getNumberOfTopics(self):
        print('getNumberOfToipcs')

        if not self.topicsBuilt:
            return False, 0

        return True, self.numberOfTopics

    def setNumberOfTopics(self, numTopics):
        print('setNumberOfTopics')

        if not self.topicsBuilt:
            return False

        self.numberOfTopics = numTopics

        # Switch to the correct data set in order to read document IDs
        self.sub_df = pd.read_csv('./TopicData/topic_{0}.csv'.format(numTopics))

        return True

    def setUserStopList(self, userStopList):
        print('setUserStopList')
        return True

    def modelBuilding(self):
        print('modelBuilding')
        return self.topicsBuilt == False

    def getModelBuilt(self):
        print('getModelBuilt')
        return self.topicsBuilt

    def createWordCloudForTopic(self, topicNumber):
        print('createWordCloudForTopic: {}'.format(topicNumber))

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
        filePath = os.path.join('./Temp', 'wordcloud.png')
        plt.savefig(filePath)
        plt.close(fig)

        # Return file as a base64 encoded string
        with open(filePath, 'rb') as f:
            image_read = f.read()

        return True, base64.encodestring(image_read).decode("utf-8")

    def getWordCloudForTopic(self, topicNumber):
        print('getWordCloudForTopic: {}'.format(topicNumber))

        if not self.topicsBuilt:
            return False, ''

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, ''

        # Get the models dictionary
        model_dict = self.topic_data['models']

        # Get the dictionary for topics found for the model built with
        # 'numberOfTopics'
        topics_dict = model_dict[str(self.numberOfTopics)]

        # Get the dictionary for the chosen topic in this model
        chosen_topic_dict = topics_dict[str(topicNumber)]

        return True, chosen_topic_dict['wordcloud']

    def getWordsForTopic(self, topicNumber):
        print('getWordsForTopic: {}'.format(topicNumber))
        return False, ''

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
        return False, ''

    def getTopicDistributionData(self):
        print('getTopicDistributionData')

        if not self.topicsBuilt:
            return False, ''

        # Get the models dictionary
        model_dict = self.topic_data['models']

        # Get the dictionary for topics found for the model built with
        # 'numberOfTopics'
        topics_dict = model_dict[str(self.numberOfTopics)]

        # Output the data
        data = {}
        for topic_id in topics_dict.keys():
            data[topic_id] = {'size': topics_dict[topic_id]['size'], 'topic': topic_id, 'wordcloud': topics_dict[topic_id]['wordcloud'], 'x': topics_dict[topic_id]['x'], 'y': topics_dict[topic_id]['y']}

        return True, json.dumps(data)

    def getDocIDsForTopic(self, topicNumber):
        print('getDocIDsForTopic')

        if not self.topicsBuilt:
            return False, []

        # Filter by topic
        messageIDs = self.sub_df[self.sub_df['topic'] == topicNumber]

        if self.documentType == DocumentTypeEnum.emailType:
            return True, messageIDs['ID'].tolist()
        else:
            # TODO: return some sort of index for regular documents
            return True, []
