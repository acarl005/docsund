from argparse import ArgumentParser
import sys
import time
import csv
import re
import multiprocessing as mp

import spacy
import pandas as pd

from to_neo4j import spacy_to_neo4j_etl

import numpy as np
import nltk
from sklearn.base import BaseEstimator, TransformerMixin
from scipy.sparse import csr_matrix
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from collections import Counter
from joblib import load

csv.field_size_limit(sys.maxsize)
ENTITIES_OF_INTEREST = ["PERSON", "NORP", "FAC", "ORG", "GPE", "LOC", "DATE", "TIME", "MONEY", "QUANTITY"]
DESIRED_COLUMNS = ["body", "date", "from", "id", "subject", "to"]
spacy_nlp = spacy.load("en_core_web_sm", disable=["parser", "textcat"])
error = None

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

    final_df = pd.concat([df.reset_index(drop=True),
                          pd.Series(y_pred_, name='prediction')],
                         axis=1, sort=False)

    if filter_spam:
        final_df = final_df.loc[final_df['prediction'] == 'ham']
        final_df = final_df.drop(columns=['prediction'])

    return final_df


def clean_enron_list(entity_list):
    for x in range(len(entity_list)):
        entity_list[x] = entity_list[x].replace("ENRONDEVELOPMENT", "")
        entity_list[x] = entity_list[x].replace("ENRON", "")
        entity_list[x] = entity_list[x].replace("Contract", "")
        entity_list[x] = entity_list[x].replace("Forward", "")
        entity_list[x] = entity_list[x].replace("Accepted", "")
        entity_list[x] = entity_list[x].replace("Login", "")
        entity_list[x] = entity_list[x].replace("URGENT OWA", "")
        entity_list[x] = re.sub(r"r?\n|\r/", "", entity_list[x])
        entity_list[x] = re.sub(r"^the\s+", "", entity_list[x], flags=re.IGNORECASE)
        entity_list[x] = re.sub(r"/[^/]*$", "", entity_list[x])
        entity_list[x] = re.sub(r"/[^-]*$", "", entity_list[x])
        entity_list[x] = re.sub(r"\s+", " ", entity_list[x])
        entity_list[x] = re.sub(r"[^a-zA-Z ]+", "", entity_list[x])
        entity_list[x] = entity_list[x].strip()
    return(entity_list)


def extract_entities(body_index, q_put_result, q_get_data, progress):
    results = []

    while True:
        data = q_get_data.get()
        if data == "END":
            break
        body = data[body_index]
        if len(body) > 25000:
            body = body[:25000]
        processed_body = spacy_nlp(body)
        for entity in ENTITIES_OF_INTEREST:
            data.append([e.text for e in list(processed_body.ents) if e.label_ == entity])
        results.append(data)
        if progress and len(results) % progress == 0:
            sys.stdout.write(".")
            sys.stdout.flush()

    q_put_result.put(results)


def main(csv_path, nrows, progress):
    cores = mp.cpu_count()
    q_recv = mp.Queue()
    num_child_processes = max(cores - 1, 1)
    children = []
    combined_results = []

    email_pipeline = Pipeline([
        ("Email to Words", EmailToWords()),
        ("Wordcount to Vector", WordCountToVector()),
    ])

    try:
        with open(csv_path) as f:
            csv_reader = csv.reader(f)
            csv_columns = next(csv_reader)
            assert sorted(csv_columns) == DESIRED_COLUMNS, ("csv columns must be {}. instead got {}"
                                                            .format(DESIRED_COLUMNS, sorted(csv_columns)))
            email_body_index = csv_columns.index("body")
            for i in range(num_child_processes):
                q_send = mp.Queue()
                proc = mp.Process(target=extract_entities, args=(email_body_index, q_recv, q_send, progress))
                children.append({"queue": q_send, "process": proc})
                proc.start()

            for i, row in enumerate(csv_reader):
                if i == nrows:
                    break
                children[i % len(children)]["queue"].put(row)

        for child in children:
            child["queue"].put("END")

        for i in range(len(children)):
            data_list = q_recv.get()
            combined_results += data_list

    except Exception as err:
        global error
        error = err
        for child in children:
            child["process"].kill()
    finally:
        for child in children:
            child["process"].join()

    if error:
        raise error
    processed_df = pd.DataFrame(combined_results, columns=csv_columns + ENTITIES_OF_INTEREST)
    del combined_results
    processed_df = apply_model(processed_df, email_pipeline)

    for entity in ["PERSON", "ORG", "FAC"]:
        processed_df[entity] = processed_df[entity].apply(lambda s: clean_enron_list(s))
    spacy_to_neo4j_etl(processed_df.sort_values(by=["id"]).set_index("id", drop=False), progress is not None)


if __name__ == "__main__":
    parser = ArgumentParser(description="Docsund's named entity recognition ETL")
    parser.add_argument("csv_path", type=str, help="path to CSV file of emails")
    parser.add_argument("-n", "--nrows", type=int, help="the number of rows to sample from the CSV")
    parser.add_argument("-p", "--progress", type=int, help="print a got every PROGRESS iterations")
    args = parser.parse_args()

    start_time = time.time()
    main(args.csv_path, args.nrows, args.progress)
    print("Time elapsed: {} min".format((time.time() - start_time) / 60))
