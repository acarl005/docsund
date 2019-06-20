import re
from itertools import count
from email.parser import Parser
from dateutil.parser import parse
from pytz import timezone
from collections import Counter, defaultdict

import pandas as pd

global_id_counter = count()

csv_path = 'emails.csv'
auth = ("neo4j", "neo4j")


def parse_email(msg):
    """Parses a raw email string into a dictionary of email fields - To, From, Subject, Body, Date."""
    eml_dict = defaultdict(lambda _: None)
    psr = Parser()
    parsed_eml = psr.parsestr(msg)
    eml_dict.update(parsed_eml)
    eml_dict['Body'] = parsed_eml.get_payload()
    return eml_dict


def parse_raw_kaggle_enron_email_csv(csv_path):
    """Parses the raw Enron emails CSV file from the Kaggle page into a list of dictionaries."""
    df = pd.read_csv(csv_path)
    msgs = df['message'].tolist()
    parsed_emails = [parse_email(msg) for msg in msgs]
    eml_df = pd.DataFrame(parsed_emails)
    COLS_OF_INTEREST = ['To', 'From', 'Subject', 'Body', 'Date']
    return eml_df.loc[:, COLS_OF_INTEREST].dropna()


eml_df = parse_raw_kaggle_enron_email_csv(csv_path)
eml_df = pd.DataFrame({
    "id": eml_df.To.apply(lambda _: next(global_id_counter)),
    "to": eml_df.To.apply(lambda s: re.split(r',\s*', re.sub(r'\n\t', '', s))),
    "from": eml_df.From,
    "subject": eml_df.Subject,
    "body": eml_df.Body.apply(lambda s: s.strip()),
    "date": eml_df.Date.apply(lambda s: parse(s).astimezone(timezone("UTC")).strftime("%Y-%m-%d %H:%M:%S"))
})

print(eml_df)

