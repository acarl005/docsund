import pandas as pd
import numpy as np
import re
from itertools import count
from dateutil.parser import parse
from pytz import timezone
from collections import defaultdict
from fuzzywuzzy import process
import time

ENTITIES_OF_INTEREST = ['PERSON', 'NORP', 'FAC', 'ORG', 'GPE', 'LOC', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW',
                        'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']


def escape_backslashes(s):
    return re.sub(r'\\', r'\\\\', s)


def unnest(df, col):
    unnested = pd.DataFrame({col: np.concatenate(df[col].values)},
                            index=df.index.repeat(df[col].str.len()))
    return unnested.join(df.drop(col, 1), how="left")


def get_entity_df(df, entity_col):
    melted = pd.melt(df, id_vars=['id'], value_vars=[entity_col])
    melted = melted.loc[melted['value'] != '']
    stacked = pd.concat([pd.Series(row['id'], row['value'].split(','))
                    for _, row in melted.iterrows()]).reset_index()
    stacked.columns = ['name', 'emailId']
    stacked['name'] = stacked.name.apply(lambda s: escape_backslashes(s.strip()))
    return stacked


def entity_list_to_string(df):
    for entity in ENTITIES_OF_INTEREST:
         df[entity] =  df[entity].apply(lambda s: ', '.join(s))
    return df


def levenstein_entities(entity_df, threshold=90):
    names = entity_df.groupby('name').count()
    names = names.sort_values(['emailId'], ascending=False)
    names = names.reset_index()

    quantile_breaks = []
    for x in range(1, 11):
        quantile_breaks.append(names.emailId.quantile(x / 10))

    unique_quantiles = list(set(quantile_breaks))

    choices = defaultdict(list)
    for i, row in names.iterrows():
        if row['emailId'] >= max(unique_quantiles):
            holding = process.extract(row['name'], names['name'],
                                      limit=unique_quantiles.index(max(unique_quantiles)) * 3)
            for x in range(len(holding)):
                if holding[x][1] >= (100-unique_quantiles.index(max(unique_quantiles)) * 3):
                    if holding[x][0] not in [item for sublist in list(choices.values()) for item in sublist]:
                        choices[row['name']].append(holding[x][0])
        else:
            unique_quantiles.pop()

    for i, row in entity_df.iterrows():
        for key, values in choices.items():
            if row['name'] in values:
                row['name'] = key

    return entity_df


def create_entity_node_relationships(df, entity_name, global_id_counter, levenstein=False):
    raw_entity_df = get_entity_df(df, entity_name)
    if levenstein:
        raw_entity_df = levenstein_entities(raw_entity_df)
    entity_df = pd.DataFrame(raw_entity_df['name'].value_counts())
    entity_df = entity_df.reset_index()
    entity_df.columns = ['name', 'mentions']
    entity_df["id"] = [str(next(global_id_counter)) for _ in range(len(entity_df))]
    entity_df.index = entity_df.id
    entity_df_n4j = pd.DataFrame({
        "entity{entity}Id:ID".format(entity=entity_name.capitalize()): entity_df.id,
        "name": entity_df.name,
        "mentions:int": entity_df.mentions,
        ":LABEL": "Entity_{entity}".format(entity=entity_name.capitalize())
    })

    save_node = "neo4j-csv/entity_{entity}.csv".format(entity=entity_name)
    entity_df_n4j.to_csv(save_node, index=False)

    relationship_df = pd.merge(entity_df, raw_entity_df, on='name')
    relationship_df = relationship_df[['id', 'emailId']]

    mentions_n4j = pd.DataFrame({
        ":START_ID": relationship_df.emailId,
        ":END_ID": relationship_df.id,
        ":TYPE": "MENTION"
    })

    save_relationship = "neo4j-csv/mentions_{entity}.csv".format(entity=entity_name)
    mentions_n4j.to_csv(save_relationship, index=False)


def spacy_to_neo4j_etl(pkl_path='processed_emails_nocoref.pkl', levenstein=False):
    # generator for globally unique IDs in neo4j
    global_id_counter = count()

    spacy_raw_df = pd.read_pickle(pkl_path)
    spacy_raw_df["to"] = spacy_raw_df.to.apply(lambda s: s.strip().split(","))
    spacy_raw_df["subject"] = spacy_raw_df.subject.fillna("").apply(lambda s: escape_backslashes(s.strip()))
    spacy_raw_df["body"] = spacy_raw_df.body.fillna("").apply(lambda s: escape_backslashes(s.strip()))
    spacy_raw_df = entity_list_to_string(spacy_raw_df)

    email_df = pd.DataFrame({
        "id": spacy_raw_df.id,
        "to": spacy_raw_df.to,
        "from_": spacy_raw_df['from'],
        "subject": spacy_raw_df.subject,
        "body": spacy_raw_df.body,
        #"resolved_body": spacy_raw_df.neuralcoref_content.apply(lambda s: escape_backslashes(s.strip())),
        "person": spacy_raw_df.PERSON.apply(lambda s: escape_backslashes(s.strip())),
        "org": spacy_raw_df.ORG.apply(lambda s: escape_backslashes(s.strip())),
        "money": spacy_raw_df.MONEY.apply(lambda s: escape_backslashes(s.strip())),
        "norp": spacy_raw_df.NORP.apply(lambda s: escape_backslashes(s.strip())),
        "fac": spacy_raw_df.FAC.apply(lambda s: escape_backslashes(s.strip())),
        "gpe": spacy_raw_df.GPE.apply(lambda s: escape_backslashes(s.strip())),
        "loc": spacy_raw_df.LOC.apply(lambda s: escape_backslashes(s.strip())),
        "date": spacy_raw_df.date.apply(lambda s: parse(s).astimezone(timezone("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ"))
    }).set_index("id", drop=False)

    email_df_n4j = pd.DataFrame({
        "emailId:ID": email_df.id,
        "to:string[]": email_df.to.apply(lambda s: ";".join(s)),
        "from": email_df.from_,
        "subject": email_df.subject,
        "body": email_df.body,
       # "resolved_body": email_df.resolved_body,
        "person": email_df.person, 
        "org": email_df.org,
        "money": email_df.money,
        "norp": email_df.norp,
        "fac": email_df.fac,
        "gpe": email_df.gpe,
        "loc": email_df.loc,
        "date:datetime": email_df.date,
        ":LABEL": "Email"
    })

    email_df_n4j.to_csv("neo4j-csv/emails.csv", index=False)

    email_unnest_df = unnest(email_df[["id", "to", "from_"]], col="to")
    email_unnest_df = email_unnest_df[email_unnest_df.to != email_unnest_df.from_]

    persons_df = pd.DataFrame({"incoming": email_unnest_df.to.value_counts(),
                               "outgoing": email_df.from_.value_counts()}).fillna(0).astype(int)
    persons_df["email"] = persons_df.index
    persons_df = persons_df.sort_values(by=["email"])
    persons_df["id"] = [str(next(global_id_counter)) for _ in range(len(persons_df))]
    persons_df.index = persons_df.id
    persons_df_n4j = pd.DataFrame({
        "personId:ID": persons_df.id,
        "email": persons_df.email,
        "incoming:int": persons_df.incoming,
        "outgoing:int": persons_df.outgoing,
        ":LABEL": "Person"
    })
    persons_df_n4j.to_csv("neo4j-csv/persons.csv", index=False)

    email_to_person_id_map = persons_df.index.to_series()
    email_to_person_id_map.index = persons_df.email

    rel_counts_df = email_unnest_df.groupby(["from_", "to"], as_index=False).count().rename(columns={"id": "counts"})
    rel_counts_df_n4j = pd.DataFrame({
        ":START_ID": email_to_person_id_map[rel_counts_df.from_].values,
        ":END_ID": email_to_person_id_map[rel_counts_df.to].values,
        "count:int": list(rel_counts_df.counts),
        ":TYPE": "EMAILS_TO"
    })

    rel_counts_df_n4j.to_csv("neo4j-csv/emails_to.csv", index=False)

    from_df_n4j = pd.DataFrame({
        ":START_ID": email_df.id,
        ":END_ID": email_to_person_id_map[email_df.from_].values,
        ":TYPE": "FROM"
    })
    from_df_n4j.to_csv("neo4j-csv/from.csv", index=False)

    to_df_n4j = pd.DataFrame({
        ":START_ID": email_unnest_df.id,
        ":END_ID": email_to_person_id_map[email_unnest_df.to].values,
        ":TYPE": "TO"
    })
    to_df_n4j.to_csv("neo4j-csv/to.csv", index=False)

    ### Entities
    entity_list = ['person', 'org', 'money', 'norp', 'fac', 'gpe', 'loc']
    for entity in entity_list:
        create_entity_node_relationships(email_df, entity, global_id_counter, levenstein)

if __name__ == '__main__':
    start_time = time.time()
    spacy_to_neo4j_etl(pkl_path='processed_emails_nocoref.pkl', levenstein=True)
    print('Time elapsed: {} min'.format((time.time() - start_time) / 60))

