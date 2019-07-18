set -ex

aws s3 cp $AWS_S3_CSV_PATH email_data.csv

python3 -m spacy download en_core_web_sm

if [ -z "${SAMPLE_SIZE}" ]; then
  python3 spacy_ner.py -p 10000 email_data.csv
else
  python3 spacy_ner.py -p 10000 -n "${SAMPLE_SIZE}" email_data.csv
fi

./import.sh
