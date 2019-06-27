import pandas as pd
import numpy as np
import re
from itertools import count
from dateutil.parser import parse
from pytz import timezone


def escape_backslashes(s):
    return re.sub(r'\\', r'\\\\', s)


def unnest(df, col):
    unnested = pd.DataFrame({col: np.concatenate(df[col].values)},
                            index=df.index.repeat(df[col].str.len()))
    return unnested.join(df.drop(col, 1), how="left")


def spacy_to_neo4j_etl(pkl_path='processed_emails.pkl'):
    # generator for globally unique IDs in neo4j
    global_id_counter = count()

    spacy_raw_df = pd.read_pickle(pkl_path)

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

    ### Entity_Person

    # person_unnest_df = unnest(email_df[["id", "to", "from_"]], col="to")
    # email_unnest_df = email_unnest_df[email_unnest_df.to != email_unnest_df.from_]

    person_entity_df = pd.DataFrame({"incoming": email_unnest_df.to.value_counts(),
                               "outgoing": email_df.from_.value_counts()}).fillna(0).astype(int)
    person_entity_df["email"] = person_entity_df.index
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





if __name__ == '__main__':
    base_df = load_processed_data(nrows=500)
    processed_df = parallelize_df(base_df, process_emails)
    parallelize_df(processed_df, process_neuralcoref, True, 'processed_emails.pkl')

