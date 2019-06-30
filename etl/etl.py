import re
from itertools import count

import numpy as np
import pandas as pd


def escape_backslashes(s):
    return re.sub(r"\$", r"\\", s)


def unnest(df, col):
    unnested = pd.DataFrame({col: np.concatenate(df[col].values)},
                            index=df.index.repeat(df[col].str.len()))
    return unnested.join(df.drop(col, 1), how="left")


def enron_to_neo4j_etl(csv_path='email_data.csv'):
    # generator for globally unique IDs in neo4j
    global_id_counter = count()

    email_df = pd.read_csv(csv_path).set_index("id", drop=False)
    email_df["to"] = email_df.to.apply(lambda s: s.strip().split(","))
    email_df["subject"] = email_df.subject.fillna("").apply(lambda s: escape_backslashes(s.strip()))
    email_df["body"] = email_df.body.fillna("").apply(lambda s: escape_backslashes(s.strip()))

    email_df_n4j = pd.DataFrame({
        "emailId:ID": email_df.id,
        "to:string[]": email_df.to.apply(lambda s: ";".join(s)),
        "from": email_df["from"],
        "subject": email_df.subject,
        "body": email_df.body,
        "date:datetime": email_df.date,
        ":LABEL": "Email"
    })

    email_df_n4j.to_csv("neo4j-csv/emails.csv", index=False)

    email_unnest_df = unnest(email_df[["id", "to", "from"]], col="to")
    email_unnest_df = email_unnest_df[email_unnest_df.to != email_unnest_df["from"]]

    persons_df = pd.DataFrame({"incoming": email_unnest_df.to.value_counts(),
                               "outgoing": email_df["from"].value_counts()}).fillna(0).astype(int)
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

    rel_counts_df = email_unnest_df.groupby(["from", "to"], as_index=False).count().rename(columns={"id": "counts"})
    rel_counts_df_n4j = pd.DataFrame({
        ":START_ID": email_to_person_id_map[rel_counts_df["from"]].values,
        ":END_ID": email_to_person_id_map[rel_counts_df.to].values,
        "count:int": list(rel_counts_df.counts),
        ":TYPE": "EMAILS_TO"
    })

    rel_counts_df_n4j.to_csv("neo4j-csv/emails_to.csv", index=False)

    from_df_n4j = pd.DataFrame({
        ":START_ID": email_df.id,
        ":END_ID": email_to_person_id_map[email_df["from"]].values,
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
    enron_to_neo4j_etl()
