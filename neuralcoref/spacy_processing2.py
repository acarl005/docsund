from __future__ import print_function, unicode_literals

import sys
import spacy
import neuralcoref
import pandas as pd
import numpy as np
import time
import re
import csv
from collections import defaultdict

ENTITIES_OF_INTEREST = ['PERSON', 'NORP', 'FAC', 'ORG', 'GPE', 'LOC', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW',
                        'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']
NLP = spacy.load('en_core_web_sm', disable=['parser', 'textcat'])
FILENAME = "enron.csv"
ENCODING = 'utf-8'

csv.field_size_limit(100000000)

columns = defaultdict(list) # each value in each column is appended to a list

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

i = 0
start_time = time.time()
with open(FILENAME) as f:
    reader = csv.DictReader(f)
    for row in reader:
        columns['id'].append(row['id'])
        body = row['body']
        processed_body = NLP(body)
        found_entities = set([ent.label_ for ent in processed_body.ents])
        for entity in ENTITIES_OF_INTEREST:
            columns[entity] = np.empty(0).tolist()
            if entity in found_entities:
                columns[entity] = [e.text for e in list(processed_body.ents) if e.label_ == entity]
        columns['body'].append(row['body'][0:25000])
        i += 1

for entity in ['PERSON', 'ORG', 'FAC']:
    columns[entity] = columns[entity].apply(lambda s: clean_enron_list(s))

df = pd.DataFrame.from_dict(columns)
df.to_pickle('test.pkl')
print('Time elapsed: {} min'.format((time.time() - start_time) / 60))
