import re
import time
import numpy as np
import pandas as pd
from nameparser import HumanName
from fuzzywuzzy import fuzz

EMAILS = pd.read_csv('neo4j-csv/persons.csv')
PERSONS = pd.read_csv('neo4j-csv/entity_person.csv')

def main(email_df=EMAILS, person_df=PERSONS):
    email_df['email'] = email_df.email.apply(lambda s: re.findall(r'[\w\.-]+@[\w\.-]+', s))
    email_df['email'] = email_df['email'].apply(', '.join)
    emails_subset = email_df.loc[(~email_df.email.str.contains(',')) & (email_df['outgoing:int'] > 0)]
    top_emails = pd.DataFrame(emails_subset.email.apply(lambda x: x.split('@')[1]).value_counts()).reset_index()
    target_domain = top_emails.at[0, 'index']
    emails_subset = emails_subset.loc[emails_subset.email.apply(lambda x: x.split('@')[1] == target_domain)]
    emails_subset['quantiles'] = pd.qcut(emails_subset['outgoing:int'], 4, labels=False, duplicates='drop')
    emails_subset = emails_subset.loc[emails_subset['quantiles'] > 1]
    emails_subset['email'] = emails_subset['email'].apply(lambda x: re.sub(r'^[^a-zA-Z0-9]', '', x))
    emails_subset = emails_subset[['personId:ID', 'email']]

    person_df['quantiles'] = pd.qcut(person_df['mentions:int'], 4, labels=False, duplicates='drop')
    person_df = person_df.loc[person_df['quantiles'] > 1]
    person_df['name'] = person_df.name.astype(str)
    person_df['FirstName'] = person_df.name.apply(lambda s: HumanName(s).first.strip())
    person_df['MiddleName'] = person_df.name.apply(lambda s: HumanName(s).middle.strip())
    person_df['LastName'] = person_df.name.apply(lambda s: HumanName(s).last.strip())
    person_df['email_address'] = np.empty((len(person_df), 0)).tolist()
    person_df = person_df.loc[~person_df.LastName.isin(['manager', 'enron', 'associate'])]
    potential_persons = person_df.loc[(person_df['LastName'] != '') & (person_df.FirstName.str.strip() != '')]

    matches = dict()
    a = 0
    for idx, r in emails_subset.iterrows():
        for i, row in potential_persons.iterrows():
            if (len(row.LastName) > 2) & ((row.LastName in emails_subset.at[idx, 'email']) or (
                    fuzz.ratio(row.LastName, emails_subset.at[idx, 'email'].split('@')[0]) > 85)):
                if (row['FirstName'][0] in emails_subset.at[idx, 'email']) & (
                        emails_subset.at[idx, 'email'] not in row['email_address']):
                    matches[a] = [str(row["entityPersonId:ID"]),
                                  str(row["name"]),
                                  str(emails_subset.at[idx, 'personId:ID']),
                                  str(emails_subset.at[idx, 'email'])]
                    a += 1
            elif (row['name'] in emails_subset.at[idx, 'email']) & (
                    emails_subset.at[idx, 'email'] not in row['email_address']):
                matches[a] = [str(row["entityPersonId:ID"]),
                              str(row["name"]),
                              str(emails_subset.at[idx, 'personId:ID']),
                              str(emails_subset.at[idx, 'email'])]
                a += 1

    email_linking = pd.DataFrame.from_dict(matches, orient='index')
    email_linking = email_linking.rename(columns={0: 'entityPersonId:ID', 1: 'name', 2: 'personId:ID', 3: 'email'})
    email_linking.to_csv("email_linking.csv", index=False)

if __name__ == '__main__':
    start_time = time.time()
    main()