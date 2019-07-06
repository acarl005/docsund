# ETL process

1. Download the emails [here](https://www.kaggle.com/wcukierski/enron-email-dataset) and unzip them into this directory.
1. Run `python preprocessing.py` to convert from the raw Kaggle format to the input CSV format.
1. Run `python etl.py` to convert the input CSV to the format expected by the `neo4j-admin import` command, documented [here](https://neo4j.com/docs/operations-manual/current/tools/import/).
1. Run `./import.sh` to ingest those CSVs into Neo4j in a database named "docsund".
1. Change the active database to "docsund" by editing the [Neo4j config](https://neo4j.com/docs/operations-manual/current/configuration/neo4j-conf/) file. The location of this file depends on your installation. If on MacOS and installed via Homebrew, it would be at something like `/usr/local/Cellar/neo4j/$VERSION/libexec/conf/neo4j.conf`.
1. Start up Neo4J.
