import os, sys, email, re
import numpy as np 
import pandas as pd
import datetime
import random
import matplotlib.pyplot as plt
import threading
import time
from enum import IntEnum
import base64

from neo4j import GraphDatabase

from EmailHelperFunctions import get_text_from_email, split_email_addresses, clean_email
from MDS import cmdscale

import gensim
from gensim import corpora
from gensim.models import CoherenceModel

from wordcloud import WordCloud

# Credentials for Neo4j database	# TODO: move to a config file
neo_user = 'neo4j'
neo_pass = 'password'
neo_url  = 'bolt://localhost:7687'

# Set the random seed for reproducability
random.seed(1)

# Set the sample sizes
optimum_sample_size = 1000
sample_size         = 10000     # TODO: this assumes that there are at least 10000 documents in the corpus

# Number of words to include in word cloud
number_of_topic_words = 30

# Download File: http://mallet.cs.umass.edu/dist/mallet-2.0.8.zip
# Mallet is Java based, so make sure Java is installed

# Set the paths to Mallet
mallet_distribution = '/home/matt/W210/mallet-2.0.8'
mallet_binary = '/home/matt/W210/mallet-2.0.8/bin/mallet'

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

            # Set paths needed by Mallet
            os.environ.update({'MALLET_HOME': mallet_distribution})
            self.mallet_path = mallet_binary

            # Compute the coherence values using Mallet
            model_list, coherence_values = self.compute_coherence_values(dictionary=self.tm.dictionary,\
                                                                         corpus=self.tm.text_term_matrix,\
                                                                         texts=self.tm.optimum_text_clean,\
                                                                         limit=35,\
                                                                         start=5,step=5)

            # Find the optimal number of topics
            limit = 35
            start = 5
            step = 5
            x = list(range(start, limit, step))
            self.tm.numberOfTopics = x[np.argmax(coherence_values)]
            print('Optimum number of topics is: {}'.format(self.tm.numberOfTopics))

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

        for i in range(0,sample_size):
            assignedTopic = self.assigned_topic(self.get_candidate_topics(i))
            topic_token_count[assignedTopic] += len(self.tm.text_term_matrix[i])
            topicSeries.append(assignedTopic)

        self.tm.token_count_proportions = np.array(topic_token_count) / sum(topic_token_count)
        self.tm.sub_df['topic'] = topicSeries

        self.tm.modelBuilt = True

        print('Finished createModelThread: {}'.format(datetime.datetime.now()))
        return True

    def process_emails(self):
        global sample_size
        global optimum_sample_size

        driver = GraphDatabase.driver(neo_url, auth=(neo_user, neo_pass))

        emails_df = pd.DataFrame(columns=['ID','Date','Message'])

        # Read emails from the Neo4j database
        with driver.session() as sesh:
            query = sesh.run("""
            MATCH(e:Email) return e.emailId, e.date, e.body
            """)

            for id_, date, message in query:
                emails_df = emails_df.append({'ID': int(id_), 'Date': pd.to_datetime(str(date)), 'Message': message}, ignore_index=True)

        # Parse the emails into a list email objects
        messages = list(map(email.message_from_string, emails_df['Message']))

        # Parse content from emails
        emails_df['content'] = list(map(get_text_from_email, messages))
        del messages
        emails_df = emails_df.drop(['Message'], axis=1)

        # Remove emails that are HTML
        emails_df = emails_df[(emails_df['content'].str.lower()).str.find("<head>") == -1]

        # Sample emails for topic modeling

        if sample_size > len(emails_df):

            # In case the hard coded sample size is greater than the number of
            # emails, then just use the number of emails
            sample_size = len(emails_df)

            # Use 10% of the sample size when determining the optimal number of
            # topics
            optimum_sample_size = round(sample_size * 0.1)

        self.tm.sub_df = emails_df.sample(sample_size, random_state=1)

        # Set the text_clean to be used to create the LDA model
        for text in self.tm.sub_df['content']:
            self.tm.text_clean.append(clean_email(text, self.tm.userStopList).split())

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

    def getWordsForTopic(self, topicNumber):
        print('getWordsForTopic: {}'.format(topicNumber))

        if not self.modelBuilt:
            return False, []

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, []

        word_frequencies = self.ldamodel.show_topic(topicNumber, number_of_topic_words)
        words = [word_pair[0] for word_pair in word_frequencies]

        return True, words

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

    def getTopicDistribution(self):
        print('getTopicDistribution')

        if not self.modelBuilt:
            return False, ''

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

        #
        # Save the figure to a file
        #

        fig = plt.figure(figsize=(10,8))
        plt.axhline(0, color='gray', alpha=0.5)
        plt.axvline(0, color='gray', alpha=0.5)

        # Marker sizes are based on points, and also note that the radius goes
        # up by the n^0.5 of the value for the marker
        marker_sizes = [ (proportion * 100 * 500) for proportion in self.token_count_proportions]

        plt.scatter(Y[:,0], -Y[:,1], s=marker_sizes, alpha=0.5, edgecolors='black')

        for i in range(0,len(topics)):
            plt.text(Y[i,0], -Y[i,1], str(i + 1), fontsize=9)

        # Save the image to a temp folder to be sent by Flask
        filePath = os.path.join('./Temp', 'topicdistribution.png')
        plt.savefig(filePath)
        plt.close(fig)

        # Return file as a base64 encoded string
        with open(filePath, 'rb') as f:
            image_read = f.read()

        return True, base64.encodestring(image_read)

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
