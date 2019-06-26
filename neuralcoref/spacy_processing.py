from __future__ import print_function, unicode_literals

import pkg_resources
pkg_resources.require('SpaCy<=2.1.3')
import spacy
import neuralcoref
import pandas as pd
import multiprocessing as mp
import numpy as np

ENTITIES_OF_INTEREST = ['PERSON', 'NORP', 'FAC', 'ORG', 'GPE', 'LOC', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW',
                        'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']
NLP = spacy.load('en_core_web_sm')

def load_processed_data(data="emails_processed.csv", nrows=5000):
    base_df = pd.read_csv(data, nrows=nrows)
    focused_df = base_df[['Message-ID', 'Subject']]
    return base_df, focused_df


def clean_threads(subject_df, subject_col='Subject'):
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
    neuralcoref.add_to_pipe(nlp)

    for idx, email in zip(df.index, nlp.pipe(df['content'].tolist(), batch_size=75)):
        df.at[idx, 'neuralcoref_content'] = email._.coref_resolved

    return df


def process_emails(df, nlp=NLP, entity_list=ENTITIES_OF_INTEREST):
    if 'processed_content' not in df:
        df['processed_content'] = None

    for i, rows in df.iterrows():
        df.at[i, 'processed_content'] = nlp(df.at[i, 'content'])
        for entity in entity_list:
            if entity in [ent.label_ for ent in list(df.at[i, 'processed_content'].ents)]:
                df.at[i, entity] = 1
            else:
                df.at[i, entity] = 0

    return df

if __name__ == '__main__':
    base_df, focused_df = load_processed_data(nrows=5000)
    processed_df = parallelize_df(base_df, process_emails)
    parallelize_df(processed_df, process_neuralcoref, True, 'processed_emails.pkl')