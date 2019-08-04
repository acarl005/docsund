from __future__ import print_function, unicode_literals

import sys
import spacy
import neuralcoref
import pandas as pd
import multiprocessing as mp
import numpy as np
import time
import re
import nltk
from sklearn.base import BaseEstimator, TransformerMixin
from scipy.sparse import csr_matrix
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
from collections import Counter
from joblib import load

ENTITIES_OF_INTEREST = ['PERSON', 'NORP', 'FAC', 'ORG', 'GPE', 'LOC', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW',
                        'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']
NLP = spacy.load('en_core_web_sm', disable=['parser', 'textcat'])
LOG_CLF = load('spam_detector.joblib')

class EmailToWords(BaseEstimator, TransformerMixin):
    def __init__(self, stripHeaders=True, lowercaseConversion=True, punctuationRemoval=True,
                 urlReplacement=True, numberReplacement=True, stemming=True):
        self.stripHeaders = stripHeaders
        self.lowercaseConversion = lowercaseConversion
        self.punctuationRemoval = punctuationRemoval
        self.urlReplacement = urlReplacement
        self.numberReplacement = numberReplacement
        self.stemming = stemming
        self.stemmer = nltk.PorterStemmer()

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        X_to_words = []
        for text in X:
            if text is None:
                text = 'empty'
            if self.lowercaseConversion:
                text = text.lower()

            if self.punctuationRemoval:
                text = text.replace('.', '')
                text = text.replace(',', '')
                text = text.replace('!', '')
                text = text.replace('?', '')

            word_counts = Counter(text.split())
            if self.stemming:
                stemmed_word_count = Counter()
                for word, count in word_counts.items():
                    stemmed_word = self.stemmer.stem(word)
                    stemmed_word_count[stemmed_word] += count
                word_counts = stemmed_word_count
            X_to_words.append(word_counts)
        return np.array(X_to_words)


class WordCountToVector(BaseEstimator, TransformerMixin):
    def __init__(self, vocabulary_size=1000):
        self.vocabulary_size = vocabulary_size

    def fit(self, X, y=None):
        total_word_count = Counter()
        for word_count in X:
            for word, count in word_count.items():
                total_word_count[word] += min(count, 10)
        self.most_common = total_word_count.most_common()[:self.vocabulary_size]
        self.vocabulary_ = {word: index + 1 for index, (word, count) in enumerate(self.most_common)}
        return self

    def transform(self, X, y=None):
        rows = []
        cols = []
        data = []
        for row, word_count in enumerate(X):
            for word, count in word_count.items():
                rows.append(row)
                cols.append(self.vocabulary_.get(word, 0))
                data.append(count)
        return csr_matrix((data, (rows, cols)), shape=(len(X), self.vocabulary_size + 1))

def apply_model(df, email_pipeline, filter_spam=True, log_clf=LOG_CLF):
    X_ = np.array(df.body)
    X_augmented_ = email_pipeline.fit_transform(X_)

    y_pred_ = log_clf.predict(X_augmented_)
    y_proba_ = log_clf.predict_proba(X_augmented_)

    final_df = pd.concat([df.reset_index(drop=True),
                          pd.Series(y_pred_, name='prediction'),
                          pd.DataFrame(y_proba_, columns=log_clf.classes_.tolist())],
                         axis=1, sort=False)

    if filter_spam:
        final_df = final_df.loc[final_df['prediction'] == 'ham']
        final_df = final_df.drop(columns=['prediction', 'ham', 'spam'])

    return final_df


def load_data(data="enron.csv", nrows=5000, skiprows=0):
    email_df = pd.read_csv(data, nrows=nrows, skiprows=skiprows)
    # limit email body to a maximum length of 25,000 characters
    email_df["body"] = email_df.body.str.slice(0, 25000)
    return email_df


def clean_threads(subject_df, subject_col='subject'):
    subject_df = subject_df.astype(str)
    subject_df[subject_col] = subject_df[subject_col].apply(lambda s: s.replace('Re:', ''))
    subject_df[subject_col] = subject_df[subject_col].apply(lambda s: s.replace('re:', ''))
    subject_df[subject_col] = subject_df[subject_col].apply(lambda s: s.replace('RE:', ''))


def parallelize_df(df, func, save=False, save_file_name=''):
    cores = mp.cpu_count()
    partitions = max(cores - 1, 1)
    df_split = np.array_split(df, partitions)
    pool = mp.Pool(cores)
    df = pd.concat(pool.map(func, df_split))
    pool.close()
    pool.join()

    if save:
        df.to_pickle(save_file_name)
        print('Saved to disk!')
    else:
        return df


def process_neuralcoref(df, nlp=NLP):
    if neuralcoref not in nlp.pipeline:
        neuralcoref.add_to_pipe(nlp)

    for idx, email in zip(df.index, nlp.pipe(df['body'].tolist(), batch_size=75)):
        df.at[idx, 'neuralcoref_body'] = email._.coref_resolved

    return df


def clean_enron_list(entity_list):
    for x in range(len(entity_list)):
        entity_list[x] = entity_list[x].replace('ENRONDEVELOPMENT', '')
        entity_list[x] = entity_list[x].replace('ENRON', '')
        entity_list[x] = entity_list[x].replace('Contract', '')
        entity_list[x] = entity_list[x].replace('Forward', '')
        entity_list[x] = entity_list[x].replace('Accepted', '')
        entity_list[x] = entity_list[x].replace('Login', '')
        entity_list[x] = entity_list[x].replace('URGENT OWA', '')
        entity_list[x] = re.sub(r'r?\n|\r/', '', entity_list[x])
        entity_list[x] = re.sub(r'^the\s+', '', entity_list[x], flags=re.IGNORECASE)
        entity_list[x] = re.sub(r'/[^/]*$', '', entity_list[x])
        entity_list[x] = re.sub(r'/[^-]*$', '', entity_list[x])
        entity_list[x] = re.sub(r'\s+', ' ', entity_list[x])
        entity_list[x] = re.sub(r'[^a-zA-Z ]+', '', entity_list[x])
        entity_list[x] = entity_list[x].strip()
    return(entity_list)


def process_emails(df, nlp=NLP, entity_list=ENTITIES_OF_INTEREST):
    new_cols = entity_list.copy()
    for col in new_cols:
        if col not in df:
            # intialize to a column of empty lists
            df[col] = np.empty((len(df), 0)).tolist()

    for i, rows in df.iterrows():
        processed_body = nlp(df.at[i, 'body'])
        found_entities = set([ent.label_ for ent in processed_body.ents])
        for entity in entity_list:
            if entity in found_entities:
                df.at[i, entity] = [e.text for e in list(processed_body.ents) if e.label_ == entity]
    for entity in ['PERSON', 'ORG', 'FAC']:
        df[entity] = df[entity].apply(lambda s: clean_enron_list(s))

    return df


def main(neuralcoref=False, nrows=5000):
    start_time = time.time()

    email_pipeline = Pipeline([
        ("Email to Words", EmailToWords()),
        ("Wordcount to Vector", WordCountToVector()),
    ])

    base_df = load_data(nrows=nrows)
    filtered_df = apply_model(base_df, email_pipeline)
    processed_df = parallelize_df(filtered_df, process_emails)
    if neuralcoref:
        parallelize_df(processed_df, process_neuralcoref, True, 'processed_emails.pkl')
    else:
        processed_df.sort_values(by=["id"]).to_pickle('processed_emails_nocoref.pkl')
    print('Time elapsed: {} min'.format((time.time() - start_time) / 60))


if __name__ == '__main__':
    nrows = sys.argv[1] if len(sys.argv) >= 2 else "5000"
    # use full dataset if the first argument is "all"
    # if its a number, use that number. otherwise, default to 5000
    nrows = None if nrows == "all" else int(nrows)
    main(nrows=nrows)
