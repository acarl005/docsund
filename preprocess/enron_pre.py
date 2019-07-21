import re
from dateutil.parser import parse
from email.parser import Parser
import csv
from hashlib import md5

import pandas as pd
from pytz import timezone
from tqdm import tqdm
tqdm.pandas()


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
    parsed_emails = df.message.progress_apply(parse_email)
    eml_df = pd.DataFrame(parsed_emails.tolist())
    cols_of_interest = ['Message-ID', 'To', 'From', 'Subject', 'Body', 'Date']
    return eml_df.loc[:, cols_of_interest].dropna()


def escape_backslashes(s):
    return re.sub(r"\$", r"\\", s)


def kaggle_preprocess(csv_path='emails.csv'):
    email_raw_df = parse_raw_kaggle_enron_email_csv(csv_path)

    email_df = pd.DataFrame({
        "id": email_raw_df["Message-ID"].str.extract(r'<\d+\.(\d+)\.JavaMail.evans@thyme>')[0],
        "to": email_raw_df.To.apply(lambda s: ",".join(set(re.split(r',\s*', re.sub(r'\n\t', '', s))))),
        "from": email_raw_df.From,
        "subject": email_raw_df.Subject.apply(lambda s: escape_backslashes(s.strip())),
        "body": email_raw_df.Body.apply(lambda s: escape_backslashes(s.strip())),
        "date": email_raw_df.Date.apply(lambda s: parse(s).astimezone(timezone("UTC")))
    }).set_index("id", drop=False)

    email_df["md5"] = email_df.body.apply(lambda b: md5(b.encode("UTF8")).hexdigest())
    email_df["date_rank"] = email_df.groupby(["md5", "from", "to"])["date"].rank(method='first')
    email_df = email_df[email_df.date_rank == 1]

    email_df["date"] = email_df.date.dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    email_df.drop(["md5", "date_rank"], axis=1).to_csv("enron_emails.csv", index=False, quoting=csv.QUOTE_ALL)


if __name__ == "__main__":
    kaggle_preprocess("enron_raw.csv")
