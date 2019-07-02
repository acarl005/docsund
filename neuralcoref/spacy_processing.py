from __future__ import print_function, unicode_literals

import pkg_resources
pkg_resources.require('SpaCy<=2.1.3')
import spacy
import neuralcoref
import pandas as pd
import multiprocessing as mp
import numpy as np
import time
import re

ENTITIES_OF_INTEREST = ['PERSON', 'NORP', 'FAC', 'ORG', 'GPE', 'LOC', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW',
                        'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']
NLP = spacy.load('en_core_web_sm')

def escape_backslashes(s):
    return re.sub(r'\\', r'\\\\', s)


def load_data(data="enron.csv", nrows=5000, skiprows=0):
    email_df = pd.read_csv(data, nrows=nrows, skiprows=skiprows).set_index("id", drop=False)
    email_df["to"] = email_df.to.apply(lambda s: s.strip().split(","))
    email_df["subject"] = email_df.subject.fillna("").apply(lambda s: escape_backslashes(s.strip()))
    email_df["body"] = email_df.body.fillna("").apply(lambda s: escape_backslashes(s.strip()))
    return email_df


def clean_threads(subject_df, subject_col='subject'):
    subject_df = subject_df.astype(str)

    for index, row in subject_df.iterrows():
        row[subject_col] = row[subject_col].replace('Re:', '')
        row[subject_col] = row[subject_col].replace('re:', '')


def parallelize_df(df, func, save=False, save_file_name=''):
    cores = mp.cpu_count()
    partitions = cores - 1
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

    for idx, email in zip(df.index, nlp.pipe(df['content'].tolist(), batch_size=75)):
        df.at[idx, 'neuralcoref_body'] = email._.coref_resolved

    return df


def process_emails(df, nlp=NLP, entity_list=ENTITIES_OF_INTEREST):
    new_cols = entity_list.copy()
    new_cols.append('processed_body')
    for col in new_cols:
        if col not in df:
            df[col] = ''

    for i, rows in df.iterrows():
        df.at[i, 'processed_body'] = nlp(df.at[i, 'body'])
        for entity in entity_list:
            if entity in [ent.label_ for ent in list(df.at[i, 'processed_body'].ents)]:
                df.at[i, entity] = [e.text for e in list(df.at[i, 'processed_body'].ents) if e.label_ == entity]

    return df


def main(neuralcoref=False):
    start_time = time.time()
    base_df = load_data(nrows=500)
    processed_df = parallelize_df(base_df, process_emails)
    if neuralcoref:
        parallelize_df(processed_df, process_neuralcoref, True, 'processed_emails.pkl')
    else:
        processed_df.to_pickle('processed_emails_nocoref.pkl')
    print('Time elapsed: {} min'.format((time.time() - start_time) / 60))
    return processed_df

if __name__ == '__main__':
    main()
