rm -r /usr/local/var/neo4j/data/databases/docsund

neo4j-admin import --database docsund \
                   --multiline-fields true \
                   --nodes neo4j-csv/persons.csv \
                   --nodes neo4j-csv/emails.csv \
                   --relationships neo4j-csv/emails_to.csv \
                   --relationships neo4j-csv/to.csv \
                   --relationships neo4j-csv/from.csv
