import sys
import csv
import json

csv.field_size_limit(sys.maxsize)

with open("email_data.csv") as csv_f:
    csv_reader = csv.DictReader(csv_f)
    with open("email_data.jsonl", "w") as json_f:
        for record in csv_reader:
            json_f.write(json.dumps(record))
            json_f.write("\n")
