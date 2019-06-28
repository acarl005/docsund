import re
from dateutil.parser import parse
from email.parser import Parser
import pandas as pd
from pytz import timezone


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
    return re.sub(r"\$", r"\\", s)


def kaggle_preprocess(csv_path='emails.csv'):
    email_raw_df = parse_raw_kaggle_enron_email_csv(csv_path)

    email_df = pd.DataFrame({
        "id": email_raw_df["Message-ID"].str.extract(r'<\d+\.(\d+)\.JavaMail.evans@thyme>')[0],
        "to": email_raw_df.To.apply(lambda s: ",".join(set(re.split(r',\s*', re.sub(r'\n\t', '', s))))),
        "from": email_raw_df.From,
        "subject": email_raw_df.Subject.apply(lambda s: escape_backslashes(s.strip())),
        "body": email_raw_df.Body.apply(lambda s: escape_backslashes(s.strip())),
        "date": email_raw_df.Date.apply(lambda s: parse(s).astimezone(timezone("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ"))
    })

    email_df.to_csv("enron.csv", index=False)


if __name__ == "__main__":
    kaggle_preprocess()
