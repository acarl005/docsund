import os, sys, email, re, string

import nltk
from nltk.corpus import stopwords 
from nltk.stem.wordnet import WordNetLemmatizer

nltk.download('stopwords')
nltk.download('wordnet')

# Max word length
max_word_length = 20

def get_text_from_email(msg):
    '''To get the content from email objects'''
    parts = []
    for part in msg.walk():
        if part.get_content_type() == 'text/plain':
            parts.append( part.get_payload() )
    return ''.join(parts)

def split_email_addresses(line):
    '''To separate multiple email addresses'''
    if line:
        addrs = line.split(',')
        addrs = frozenset(map(lambda x: x.strip(), addrs))
    else:
        addrs = None
    return addrs

def clean_email(text, userStopList):
    stop = set(stopwords.words('english'))
    stop.update(("to","cc","subject","from","sent","http","www","com"))

    if userStopList:
        stop.update(tuple(userStopList))

    exclude = set(string.punctuation) 
    lemma = WordNetLemmatizer()

    # Remove long words - these are most likely base64 strings
    text = ' '.join([word for word in text.split() if (len(word) <= max_word_length)])

    text=text.rstrip()
    text = re.sub(r'[^a-zA-Z]', ' ', text)
    stop_free  = ' '.join([word for word in text.lower().split() if((word not in stop) and (not word.isdigit()))])
    punc_free  = ' '.join(word for word in stop_free.split() if word not in exclude)
    normalized = ' '.join(lemma.lemmatize(word) for word in punc_free.split())

    return normalized
