import pandas as pd
import numpy as np
import re
from itertools import count
from dateutil.parser import parse
from pytz import timezone

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
    for i in df.index:
        for entity in ENTITIES_OF_INTEREST:
            df[entity][i] = ', '.join(df[entity][i])
    return df


def create_entity_node_relationships(df, entity_name, global_id_counter):
    entity_df = get_entity_df(df, entity_name)
    entity_df = pd.DataFrame(entity_df.groupby('emailId')['name'].value_counts())
    entity_df = entity_df.reset_index(level='emailId')
    entity_df.columns = ['emailId', 'mentions']
    entity_df = entity_df.reset_index()
    entity_df = entity_df.sort_values(by=["emailId"])
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

    mentions_n4j = pd.DataFrame({
        ":START_ID": entity_df.emailId,
        ":END_ID": entity_df.id,
        ":TYPE": "MENTION"
    })

    save_relationship = "neo4j-csv/mentions_{entity}.csv".format(entity=entity_name)
    mentions_n4j.to_csv(save_relationship, index=False)


def spacy_to_neo4j_etl(pkl_path='processed_emails.pkl'):
    # generator for globally unique IDs in neo4j
    global_id_counter = count()

    spacy_raw_df = pd.read_pickle(pkl_path)
    spacy_raw_df = entity_list_to_string(spacy_raw_df)

    email_df = pd.DataFrame({
        "id": spacy_raw_df["Message-ID"].str.extract(r'<\d+\.(\d+)\.JavaMail.evans@thyme>')[0],
        "to": spacy_raw_df.To.apply(lambda s: list(set(re.split(r',\s*', re.sub(r'\n\t', '', s))))),
        "from_": spacy_raw_df.From,
        "subject": spacy_raw_df.Subject.apply(lambda s: escape_backslashes(s.strip())),
        "body": spacy_raw_df.content.apply(lambda s: escape_backslashes(s.strip())),
        "resolved_body": spacy_raw_df.neuralcoref_content.apply(lambda s: escape_backslashes(s.strip())),
        "person": spacy_raw_df.PERSON.apply(lambda s: escape_backslashes(s.strip())),
        "org": spacy_raw_df.ORG.apply(lambda s: escape_backslashes(s.strip())),
        "money": spacy_raw_df.MONEY.apply(lambda s: escape_backslashes(s.strip())),
        "norp": spacy_raw_df.NORP.apply(lambda s: escape_backslashes(s.strip())),
        "fac": spacy_raw_df.FAC.apply(lambda s: escape_backslashes(s.strip())),
        "gpe": spacy_raw_df.GPE.apply(lambda s: escape_backslashes(s.strip())),
        "loc": spacy_raw_df.LOC.apply(lambda s: escape_backslashes(s.strip())),
        "date": spacy_raw_df.Date.apply(lambda s: parse(s).astimezone(timezone("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ"))
    }).set_index("id", drop=False)

    email_df_n4j = pd.DataFrame({
        "emailId:ID": email_df.id,
        "to:string[]": email_df.to.apply(lambda s: ";".join(s)),
        "from": email_df.from_,
        "subject": email_df.subject,
        "body": email_df.body,
        "resolved_body": email_df.resolved_body,
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
        create_entity_node_relationships(email_df, entity, global_id_counter)

if __name__ == '__main__':
    spacy_to_neo4j_etl()
