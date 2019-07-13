# SpaCy Processing & ETL

1. **This is meant to be run after the `python preprocess.py` script in docsund\etl.**
2. Run `python spacy_processing.py` to process the raw CSV with SpaCy; it will identify and extract all entities by type (see the [SpaCy named entity documentation] (https://spacy.io/api/annotation#named-entities). It will optionally apply the `neuralcoref` model to perform coreference resolution *within* each email. However, this is a very computationally heavy task, so proceed with caution if you opt to enable that when running the script.
	- This process also performs some basic preprocessing and clean-up to PERSON, ORG, and FAC entities.
	- For development purposes, the number of rows of `enron.csv` being read in is set to 5000 in the `main`; update as needed.
3. Run `python spacy_etl.py` to convert the processed .pkl file into the format expected by the `neo4j-admin import` command, documented [here](https://neo4j.com/docs/operations-manual/current/tools/import/).
    - This uses the `fuzzywuzzy` package to do some basic entity linking (Levenshtein distance); right now, this is only for the **person** entity type because it's pretty slow.
4. Run `./import.sh` to ingest those CSVs into Neo4j in a database named "docsund" (or, if you're stuck in Windows hell like me, `neo4j-admin import --f=import.txt`).
5. Change the active database to "docsund" by editing the [Neo4j config](https://neo4j.com/docs/operations-manual/current/configuration/neo4j-conf/) file. The location of this file depends on your installation. If on MacOS and installed via Homebrew, it would be at something like `/usr/local/Cellar/neo4j/$VERSION/libexec/conf/neo4j.conf`.
6. Start up Neo4J.


# Increasing efficiency
## SpaCy Processing
The following were attempted to increase the speed/decrease the memory usage when running `python spacy_processing.py all`:
- Chunking with `pd.read_csv`'s `chunksize` argument and looping through the script in batches for the entire dataset
- Streaming the dataset with Python's base csv functionality
- Removing/altering the multiprocessing functionality
- Using `nlp.pipe` instead of `nlp` when processing the emails