import re
from itertools import count
from email.parser import Parser
from dateutil.parser import parse
from pytz import timezone

import numpy as np
import pandas as pd


def parse_email(msg):
    """Parses a raw email string into a dictionary of email fields - To, From, Subject, Body, Date."""
    eml_dict = {}
    psr = Parser()
    parsed_eml = psr.parsestr(msg)
    eml_dict.update(parsed_eml)
    eml_dict['Body'] = parsed_eml.get_payload()
    return eml_dict


def parse_raw_kaggle_enron_email_csv(csv_path):
    """Parses the raw Enron emails CSV file from the Kaggle page into a list of dictionaries."""
    df = pd.read_csv(csv_path)
    parsed_emails = df.message.apply(parse_email)
    eml_df = pd.DataFrame(parsed_emails.tolist())
    cols_of_interest = ['Message-ID', 'To', 'From', 'Subject', 'Body', 'Date']
    return eml_df.loc[:, cols_of_interest].dropna()


def escape_backslashes(s):
    return re.sub(r'\\', r'\\\\', s)


def unnest(df, col):
    unnested = pd.DataFrame({col: np.concatenate(df[col].values)},
                            index=df.index.repeat(df[col].str.len()))
    return unnested.join(df.drop(col, 1), how="left")


def kaggle_to_neo4j_etl(csv_path='emails.csv'):
    # generator for globally unique IDs in neo4j
    global_id_counter = count()

    email_raw_df = parse_raw_kaggle_enron_email_csv(csv_path)

    email_df = pd.DataFrame({
        "id": email_raw_df["Message-ID"].str.extract(r'<\d+\.(\d+)\.JavaMail.evans@thyme>')[0],
        "to": email_raw_df.To.apply(lambda s: list(set(re.split(r',\s*', re.sub(r'\n\t', '', s))))),
        "from_": email_raw_df.From,
        "subject": email_raw_df.Subject.apply(lambda s: escape_backslashes(s.strip())),
        "body": email_raw_df.Body.apply(lambda s: escape_backslashes(s.strip())),
        "date": email_raw_df.Date.apply(lambda s: parse(s).astimezone(timezone("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ"))
    }).set_index("id", drop=False)

    email_df_n4j = pd.DataFrame({
        "emailId:ID": email_df.id,
        "to:string[]": email_df.to.apply(lambda s: ";".join(s)),
        "from": email_df.from_,
        "subject": email_df.subject,
        "body": email_df.body,
        "date:datetime": email_df.date,
        ":LABEL": "Email"
    })

    email_df_n4j.to_csv("neo4j-csv/emails.csv", index=False)

    email_unnest_df = unnest(email_df[["id", "to", "from_"]], col="to")
    email_unnest_df = email_unnest_df[email_unnest_df.to != email_unnest_df.from_]

    persons_df = pd.DataFrame({"incoming": email_unnest_df.to.value_counts(),
                               "outgoing": email_df.from_.value_counts()}).fillna(0).astype(int)
    persons_df["email"] = persons_df.index
    persons_df["id"] = [next(global_id_counter) for _ in range(len(persons_df))]
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


if __name__ == "__main__":
    kaggle_to_neo4j_etl()
