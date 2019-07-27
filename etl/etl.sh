set -ex

curl -L 'https://github.com/neo4j-contrib/neo4j-graph-algorithms/releases/download/3.5.4.0/graph-algorithms-algo-3.5.4.0.jar' \
  -o /plugins/graph-algorithms-algo-3.5.4.0.jar

aws s3 cp $AWS_S3_CSV_PATH email_data.csv

python3 -m spacy download en_core_web_sm

if [ -z "${SAMPLE_SIZE}" ]; then
  python3 spacy_ner.py -p 10000 email_data.csv
else
  python3 spacy_ner.py -p 10000 -n "${SAMPLE_SIZE}" email_data.csv
fi

./import.sh
