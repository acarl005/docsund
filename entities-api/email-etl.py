import json
from neo4j import GraphDatabase


def add_emails(tx):
    with open("./node_mappings.json") as f:
        mappings = json.load(f)
    for email, id in mappings.items():
        tx.run("""
            MATCH (p:Person)
            WHERE ID(p) = $id
            SET p.email = $email
            RETURN p
        """, id=id, email=email)


driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "neo4j"))
with driver.session() as sesh:
    sesh.write_transaction(add_emails)

