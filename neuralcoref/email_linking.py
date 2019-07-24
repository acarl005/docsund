import re
import time
import numpy as np
import pandas as pd
from nameparser import HumanName
from fuzzywuzzy import fuzz

EMAILS = pd.read_csv('neo4j-csv/persons.csv')
PERSONS = pd.read_csv('neo4j-csv/entity_person.csv')

def preprocess_emails(email_df=EMAILS, person_df=PERSONS):
    email_df['email'] = email_df.email.apply(lambda s: re.findall(r'[\w\.-]+@[\w\.-]+', s))
    email_df['email'] = email_df['email'].apply(', '.join)
    emails_subset = email_df.loc[(~email_df.email.str.contains(',')) & (email_df['outgoing:int'] > 0)]
    emails_subset = emails_subset.loc[emails_subset.email.apply(lambda x: len(x.split('@'))) == 2]
    top_emails = pd.DataFrame(emails_subset.email.apply(lambda x: x.split('@')[1]).value_counts()).reset_index()
    target_domain = top_emails.at[0, 'index']
    emails_subset = emails_subset.loc[emails_subset.email.apply(lambda x: x.split('@')[1] == target_domain)]
    emails_subset['email'] = emails_subset['email'].apply(lambda x: re.sub(r'^[^a-zA-Z0-9]', '', x).lower())
    emails_subset = emails_subset[['personId:ID', 'email']]
    #emails_subset['email'] = person_df.name.apply(lambda x: x.lower())

    person_df['name'] = person_df.name.astype(str)
    person_df['name'] = person_df.name.apply(lambda x: x.lower())
    person_df['FirstName'] = person_df.name.apply(lambda s: HumanName(s).first.strip())
    person_df['MiddleName'] = person_df.name.apply(lambda s: HumanName(s).middle.strip())
    person_df['LastName'] = person_df.name.apply(lambda s: HumanName(s).last.strip())
    person_df['email_address'] = np.empty((len(person_df), 0)).tolist()
    person_df = person_df.loc[~person_df.LastName.isin(['manager', 'enron', 'associate'])]
    potential_persons = person_df.loc[(person_df['LastName'] != '') & (person_df.FirstName.str.strip() != '')]
    return emails_subset, potential_persons

def match_initials(name):
    for email, email_id in zip(email_list, id_list):
        if len(name[1]) > 2:
            if name[1] in email:
                if name[0][0] in email:
                    return email, email_id
            if fuzz.ratio(name[1], email.split('@')[0]) > 80:
                if name[0][0] in email:
                    return email, email_id
        if name[0][0]+name[1] in email:
             return email, email_id
        if name[1]+name[0][0] in email:
            return email, email_id

def match_full(name):
    for email, email_id in zip(email_list, id_list):
        if (name[0] + '.' + name[1]) == email.split('@')[0]:
            return email, email_id
        if (name[0] + '_' + name[1]) == email.split('@')[0]:
            return email, email_id
        if len(re.split("\W+", email.split('@')[0])) >= 2:
            if fuzz.ratio(name[1], re.split("\W+", email.split('@')[0])[-1]) > 80:
                if fuzz.ratio(name[0], re.split("\W+", email.split('@')[0])[0]) > 80:
                    return email, email_id

if __name__ == '__main__':
    start_time = time.time()
    emails_subset, potential_persons = preprocess_emails()
    email_list = emails_subset.email.to_list()
    id_list = emails_subset['personId:ID'].to_list()
    if np.mean(emails_subset['email'].apply(lambda x: len(re.split("\W+", x.split('@')[0])))) >= 2:
        potential_persons['matches'] = potential_persons.apply(lambda x: match_full([x.FirstName,x.LastName]), axis=1)
    else:
        potential_persons['matches'] = potential_persons.apply(lambda x: match_initials([x.FirstName,x.LastName]), axis=1)

    subset = potential_persons[~potential_persons['matches'].isnull()]
    subset[['email', 'personId:ID']] = pd.DataFrame(subset['matches'].values.tolist(), index=subset.index)
    final_subset = subset[['personId:ID', 'email', 'entityPersonId:ID', 'name']]
    final_subset.to_csv('email_linking.csv', index=False)
    print('Time elapsed: {} min'.format((time.time() - start_time) / 60))