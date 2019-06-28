set -e

aws s3 cp $AWS_S3_CSV_PATH email_data.csv
python3 etl.py
./import.sh
