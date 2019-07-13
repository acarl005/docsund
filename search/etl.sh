set -ex

aws s3 cp $AWS_S3_CSV_PATH email_data.csv
python csv_to_json.py
