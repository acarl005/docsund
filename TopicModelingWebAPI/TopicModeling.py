import os, sys, email, re
import numpy as np 
import pandas as pd
import datetime
import random
import matplotlib.pyplot as plt
import threading
import time
from enum import IntEnum

from EmailHelperFunctions import get_text_from_email, split_email_addresses, clean_email
from MDS import cmdscale

import gensim
from gensim import corpora
from gensim.models import CoherenceModel

from wordcloud import WordCloud


# Set the random seed for reproducability
np.random.seed(1)

# Set the sample sizes
optimum_sample_size = 1000
sample_size         = 10000     # TODO: this assumes that there are at least 10000 documents in the corpus

# Download File: http://mallet.cs.umass.edu/dist/mallet-2.0.8.zip
# Mallet is Java based, so make sure Java is installed

# Set the paths to Mallet
mallet_distribution = 'F:/W210/Prototypes/TopicDemo/mallet-2.0.8/'
mallet_binary = 'F:/W210/Prototypes/TopicDemo/mallet-2.0.8/bin/mallet'

class DocumentTypeEnum(IntEnum):
    unknownType = 0
    emailType = 1           # 'emails'
    documentType = 2        # 'documents'

class findNumTopicsThread (threading.Thread):
    def __init__(self, tmo):
        threading.Thread.__init__(self)
        self.tm = tmo
        self.mallet_path = ''

    def run(self):
        print('Starting findNumTopicsThread: {}'.format(datetime.datetime.now()))

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
            print('Error in findNumTopicsThread, document type not specified')
            return False;

        # Create the dictionary for the model
        self.tm.dictionary = corpora.Dictionary(self.tm.optimum_text_clean)

        # Create the text_term_matrix
        self.tm.text_term_matrix = [self.tm.dictionary.doc2bow(text) for text in self.tm.optimum_text_clean]

        # Set paths needed by Mallet
        os.environ.update({'MALLET_HOME': mallet_distribution})
        self.mallet_path =  mallet_binary

        # Compute the coherence values using Mallet
        model_list, coherence_values = self.compute_coherence_values(dictionary=self.tm.dictionary,\
                                                                     corpus=self.tm.text_term_matrix,\
                                                                     texts=self.tm.optimum_text_clean,\
                                                                     limit=35,\
                                                                     start=5,step=5)

        # Find the optimal number of topics
        limit=35; start=5; step=5;
        x = list(range(start, limit, step))
        self.tm.numberOfTopics = x[np.argmax(coherence_values)]
        print('Optimum number of topics is: {}'.format(self.tm.numberOfTopics))

        print('Finished findNumTopicsThread: {}'.format(datetime.datetime.now()))
        return True

    def process_emails(self):
        # Read emails from the .csv file
        emails_df = pd.read_csv(self.tm.fileToProcess)

        # Parse the emails into a list email objects
        messages = list(map(email.message_from_string, emails_df['message']))
        emails_df.drop('message', axis=1, inplace=True)

        # Get fields from parsed email objects
        keys = messages[0].keys()
        for key in keys:
            emails_df[key] = [doc[key] for doc in messages]

        # Parse content from emails
        emails_df['content'] = list(map(get_text_from_email, messages))

        # Remove emails that are HTML
        emails_df = emails_df[ (emails_df['content'].str.lower()).str.find("<head>") == -1 ]

        # Split multiple email addresses
        emails_df['From'] = emails_df['From'].map(split_email_addresses)
        emails_df['To']   = emails_df['To'].map(split_email_addresses)

        # Extract the root of 'file' as 'user'
        emails_df['user'] = emails_df['file'].map(lambda x:x.split('/')[0])

        del messages

        emails_df = emails_df.drop(['file', 'Mime-Version', 'Content-Type', 'Content-Transfer-Encoding'], axis=1)

        # Parse datetime
        emails_df['Date'] = pd.to_datetime(emails_df['Date'], infer_datetime_format=True)
        emails_df = emails_df[['Message-ID', 'From', 'To', 'Date','content']].dropna()
        emails_df = emails_df.loc[emails_df['To'].map(len) == 1]
        self.tm.sub_df = emails_df.sample(sample_size, random_state=1)

        # Set the text_clean to be used to create the LDA model
        for text in self.tm.sub_df['content']:
            self.tm.text_clean.append(clean_email(text).split())

        # Use a smaller sample to find the coherence values in compute_coherence_values()
        self.tm.optimum_text_clean = [
            self.tm.text_clean[i] for i in random.sample(range(len(self.tm.text_clean)), optimum_sample_size)
        ]

    def process_documents(self):
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

class createModelThread (threading.Thread):
    def __init__(self, tmo):
        threading.Thread.__init__(self)
        self.tm = tmo

    def assigned_topic(self, candidateTopics):
        largest = (0,0.0)
        for topic in candidateTopics:
            if topic[1] > largest[1]:
                largest = topic
        return largest[0]

    def get_candidate_topics(self, index):
        return self.tm.ldamodel.get_document_topics(self.tm.text_term_matrix[index])

    def run(self):
        print('Starting createModelThread: {}'.format(datetime.datetime.now()))

        # Create the dictionary and term matrix used by LDA
        self.tm.dictionary = corpora.Dictionary(self.tm.text_clean)
        self.tm.text_term_matrix = [self.tm.dictionary.doc2bow(text) for text in self.tm.text_clean]

        # Buid the Gensim LDA model
        Lda = gensim.models.ldamodel.LdaModel

        self.tm.ldamodel = Lda(self.tm.text_term_matrix, num_topics=self.tm.numberOfTopics, id2word = self.tm.dictionary, passes=30)

        #
        # Get token count proportion statistics for the plot. Also add topic category to sub_df
        #

        topic_token_count = [0 for i in range(0,self.tm.numberOfTopics)]
        topicSeries = []

        for i in range(0,sample_size):
            assignedTopic = self.assigned_topic(self.get_candidate_topics(i))
            topic_token_count[assignedTopic] += len(self.tm.text_term_matrix[i])
            topicSeries.append(assignedTopic)

        self.tm.token_count_proportions = np.array(topic_token_count)/sum(topic_token_count)
        self.tm.sub_df['topic'] = topicSeries

        self.tm.modelBuilt = True
        print('Finished createModelThread: {}'.format(datetime.datetime.now()))

class TopicModeling:
    def __init__(self):
        self.fileToProcess = ''
        self.documentType = DocumentTypeEnum.unknownType
        self.sub_df = None
        self.dictionary = None
        self.text_term_matrix = None
        self.text_clean = []
        self.optimum_text_clean = []
        self.numberOfTopics = 0
        self.ldamodel = None
        self.modelBuilt = False
        self.findNumTopicsThread_ = None
        self.createModelThread_ = None

    def setFileToProcess(self, fileToProcess, documentType):
        fileToProcess = os.path.join('./UploadedFiles', fileToProcess)
        print('setFileToProcess: {}'.format(fileToProcess))

        if not os.path.isfile(fileToProcess):
            return False

        self.fileToProcess = fileToProcess
        self.documentType = documentType

        return True

    def getFileToProcess(self):
        print('getFileToProcess')
        return self.fileToProcess

    def startFindNumberOfTopics(self):
        print('startFindNumberOfTopics')

        if (self.findNumTopicsThread_ != None) and (self.findNumTopicsThread_.isAlive()):
            return False

        self.numberOfTopics = 0
        self.findNumTopicsThread_ = findNumTopicsThread(self)
        self.findNumTopicsThread_.start()

        return True

    def getNumberOfTopics(self):
        print('getNumberOfToipcs')

        if (self.findNumTopicsThread_ == None) or (self.findNumTopicsThread_.isAlive()):
            return False, 0

        return True, self.numberOfTopics

    def startBuildingModel(self):
        print('startBuildingModel')

        if self.numberOfTopics == 0:
            return False

        if (self.createModelThread_ != None) and (self.createModelThread_.isAlive()):
            return False

        self.modelBuilt = False
        self.createModelThread_ = createModelThread(self)
        self.createModelThread_.start()

        return True

    def getModelBuilt(self):
        print('getModelBuilt')

        if (self.createModelThread_ == None) or (self.createModelThread_.isAlive()):
            return False

        return self.modelBuilt

    def getWordsForTopic(self, topicNumber):
        print('getWordsForTopic: {}'.format(topicNumber))

        if not self.modelBuilt:
            return False, []

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, []

        word_frequencies = self.ldamodel.show_topic(topicNumber, 20)
        words = [word_pair[0] for word_pair in word_frequencies]

        return True, words

    def getWordCloudForTopic(self, topicNumber):
        print('getWordCloudForTopic: {}'.format(topicNumber))

        if not self.modelBuilt:
            return False, ''

        if (topicNumber < 0) or (topicNumber >= self.numberOfTopics):
            return False, []

        word_frequencies = self.ldamodel.show_topic(topicNumber, 20)

        # Generate a word cloud image
        wordFreqDict = dict(word_frequencies)
        wordcloud = WordCloud().fit_words(wordFreqDict)
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis("off")

        # Save the image to a temp folder to be sent by Flask
        filePath = os.path.join('./Temp', 'wordcloud.png')
        plt.savefig(filePath)

        return True, filePath

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

        plt.figure(figsize=(10,8))
        plt.axhline(0, color='gray', alpha=0.5)
        plt.axvline(0, color='gray', alpha=0.5)

        # Marker sizes are based on points, and also note that the radius goes up by the n^0.5 of the value for the marker
        marker_sizes = [ (proportion*100*500) for proportion in self.token_count_proportions]

        plt.scatter(Y[:,0], -Y[:,1], s=marker_sizes, alpha=0.5, edgecolors='black')

        for i in range(0,len(topics)):
            plt.text(Y[i,0], -Y[i,1], str(i+1), fontsize=9)

        # Save the image to a temp folder to be sent by Flask
        filePath = os.path.join('./Temp', 'topicdistribution.png')
        plt.savefig(filePath)

        return True, filePath

    def getDocIDsForTopic(self, topicNumber):
        print('getDocIDsForTopic')

        if not self.modelBuilt:
            return False, []

        # Filter by topic
        messageIDs = self.sub_df[self.sub_df['topic'] == topicNumber]

        if self.documentType == DocumentTypeEnum.emailType:
            return True, messageIDs['Message-ID'].tolist()
        else:
            # TODO: return some sort of index for regular documents
            return True, []
