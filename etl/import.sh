neo4j-admin import --database graph.db \
                   --multiline-fields true \
                   --nodes neo4j-csv/persons.csv \
                   --nodes neo4j-csv/emails.csv \
                   --relationships neo4j-csv/emails_to.csv \
                   --relationships neo4j-csv/to.csv \
                   --relationships neo4j-csv/from.csv
