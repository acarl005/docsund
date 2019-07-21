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
    emails_subset['quantiles'] = pd.qcut(emails_subset['outgoing:int'],4,labels=False, duplicates='drop')
    emails_subset = emails_subset.loc[emails_subset['quantiles'] > 1]
    email_array = emails_subset.email.unique()

    person_df['quantiles'] = pd.qcut(person_df['mentions:int'],4,labels=False, duplicates='drop')
    person_df = person_df.loc[person_df['quantiles'] > 1]
    person_df['name'] = person_df.name.astype(str)
    person_df['FirstName'] = person_df.name.apply(lambda s: HumanName(s).first.strip())
    person_df['MiddleName'] = person_df.name.apply(lambda s: HumanName(s).middle.strip())
    person_df['LastName'] = person_df.name.apply(lambda s: HumanName(s).last.strip())
    person_df['email_address'] = np.empty((len(person_df), 0)).tolist()
    potential_persons = person_df.loc[(person_df['LastName'] != '') & (person_df.FirstName.str.strip() != '')]

    for email in email_array:
        for i, row in potential_persons.iterrows():
            if (len(row.LastName) > 1) & ((row.LastName in email) or (fuzz.ratio(row.LastName, email.split('@')[0]) > 85)):
                if (row['FirstName'][0] in email) & (email not in row['email_address']):
                    row['email_address'].append(email)
            elif (row['name'] in email) & (email not in row['email_address']):
                row['email_address'].append(email)

    final_persons = potential_persons[potential_persons['email_address'].str.len()>0]
    final_persons = final_persons[['entityPersonId:ID', 'name', 'email_address']]
    final_persons.to_csv("email_linking.csv", index=False)

if __name__ == '__main__':
    start_time = time.time()
    main()