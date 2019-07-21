import os
import json
import logging
from math import floor, ceil
import random

from neo4j import GraphDatabase
from neotime import DateTime
from elasticsearch import Elasticsearch
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

# set up the app config
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

logging.basicConfig(format="%(asctime)s - %(levelname)s:%(message)s", level=logging.INFO)

neo4j_host = os.getenv("NEO4J_DATABASE_SERVICE_HOST", "localhost")
neo4j_port = os.getenv("NEO4J_DATABASE_SERVICE_PORT_MAIN", "7687")
neo4j_url = "bolt://{}:{}".format(neo4j_host, neo4j_port)
neo4j_user = os.getenv("NEO4J_DATABASE_USER", "neo4j")
neo4j_password = os.getenv("NEO4J_DATABASE_PASSWORD", "neo4j").strip()

logging.info("connecting to %s as user %s", neo4j_url, neo4j_user)
driver = GraphDatabase.driver(neo4j_url, auth=(neo4j_user, neo4j_password))
logging.info("connected")

es_host = os.getenv("ELASTICSEARCH_SERVICE_HOST", "localhost")
es_port = os.getenv("ELASTICSEARCH_SERVICE_PORT_MAIN", "9200")
es_url = "http://{}:{}".format(es_host, es_port)

logging.info("connecting to %s", es_url)
es = Elasticsearch([es_url])
logging.info("connected")


def neo4j_node_to_dict(node):
    node_dict = dict(node)
    for key, val in node_dict.items():
        # the neo4j DateTime cannot be JSON serialized automatically, so we must explicitly coerce to a str
        if isinstance(val, DateTime):
            node_dict[key] = val.iso_format()[:19]
    return {
        "id": node.id,
        "labels": list(node.labels),
        "properties": node_dict
    }


def neo4j_edge_to_dict(edge):
    return {
        "id": edge.id,
        "type": edge.type,
        "startNodeId": edge.nodes[0].id,
        "endNodeId": edge.nodes[1].id,
        "properties": dict(edge),
    }


def virtual_person_entity_id(id_a, id_b):
    return 10000000 + id_a + id_b


def virtual_entity_entity_id(id_a, id_b):
    return 20000000 + id_a + id_b


@app.route("/_ping")
def health_check():
    return 'pong'


@app.route("/person/<int:id>", methods=["GET"])
@cross_origin()
def find_person(id):
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (p:Person)
            WHERE ID(p) = $id
            RETURN p
        """, id=id)
        maybe_node = query.single()
        if maybe_node is None:
            return jsonify(error=404, text="person not found"), 404
        node = neo4j_node_to_dict(maybe_node[0])
    return jsonify(node)


@app.route("/person/<int:id>/graph-neighbours", methods=["GET"])
@cross_origin()
def get_person_neighbours(id):
    limit = request.args.get("limit", type=int)
    with driver.session() as sesh:
        center_query = """
            MATCH (center)
            WHERE ID(center) = $id
            RETURN labels(center)
        """
        center_labels = sesh.run(center_query, id=id).single()
        if center_labels is None or center_labels[0] != ["Person"]:
            return jsonify(error=400, text="ID {} is not a Person".format(id)), 400

        person_neighbours_query = """
            MATCH (center:Person)-[emails_to:EMAILS_TO]-(neighbours:Person)
            WHERE ID(center) = $id
            RETURN DISTINCT neighbours, reduce(sum = 0, em IN collect(emails_to) | sum + em.count) AS tot_msgs
            ORDER BY tot_msgs DESC
            {}
        """.format("LIMIT $limit" if limit is not None else "")
        results = sesh.run(person_neighbours_query, id=id, limit=limit).values()
        person_neighbours = [neo4j_node_to_dict(record[0]) for record in results]

        entity_neighbours_query = """
            MATCH (center:Person)<-[]-(emails:Email)-[:MENTION]->(en:Entity)
            WHERE ID(center) = $id
              AND (
                en:Entity_Fac OR
                en:Entity_Gpe OR
                en:Entity_Org OR
                en:Entity_Norp OR
                en:Entity_Person OR
                en:Entity_Money
              )
            RETURN DISTINCT en, count(emails) AS tot_emails
            ORDER BY tot_emails DESC
            {}
        """.format("LIMIT $limit" if limit is not None else "")
        results = sesh.run(entity_neighbours_query, id=id, limit=limit)
        entity_neighbours = []
        entity_neighbour_counts = []
        for record in results:
            entity_neighbours.append(neo4j_node_to_dict(record[0]))
            entity_neighbour_counts.append(record[1])

        if limit is not None:
            desired_num_entities = floor(limit / 2)
            entities_short_by = max(desired_num_entities - len(entity_neighbours), 0)
            person_neighbours = person_neighbours[:ceil(limit / 2) + entities_short_by]
            entity_neighbours = entity_neighbours[:limit - len(person_neighbours)]

        person_neighbour_ids = [neighbour["id"] for neighbour in person_neighbours]
        person_relationships_query = """
            MATCH (center:Person)-[emails_to:EMAILS_TO]-(neighbours:Person)
            WHERE ID(center) = $id AND ID(neighbours) IN $neighbour_ids
            RETURN emails_to
        """
        results = sesh.run(person_relationships_query, id=id, neighbour_ids=person_neighbour_ids).value()
        person_relationships = [neo4j_edge_to_dict(record) for record in results]

        entity_relationships = [
            {
                "id": virtual_person_entity_id(id, entity_neighbour["id"]),
                "type": "DISCUSSED",
                "startNodeId": id,
                "endNodeId": entity_neighbour["id"],
                "properties": {
                    "count": entity_neighbour_counts[i]
                },
            }
            for i, entity_neighbour in enumerate(entity_neighbours)
        ]
    neighbours = person_neighbours + entity_neighbours
    relationships = person_relationships + entity_relationships

    return jsonify({
        "neighbours": neighbours,
        "relationships": relationships,
    })


@app.route("/entities/<int:id>/graph-neighbours", methods=["GET"])
@cross_origin()
def get_entity_neighbours(id):
    limit = request.args.get("limit", type=int, default=1000)
    with driver.session() as sesh:
        center_query = """
            MATCH (center)
            WHERE ID(center) = $id
            RETURN labels(center)
        """
        center_labels = sesh.run(center_query, id=id).single()
        if center_labels is None or "Entity" not in center_labels[0]:
            return jsonify(error=400, text="ID {} is not an Entity".format(id)), 400

        person_neighbours_query = """
            MATCH (center:Entity)<-[:MENTION]-(emails:Email)-[]->(neighbours:Person)
            WHERE ID(center) = $id
            RETURN DISTINCT neighbours, count(emails) AS tot_emails
            ORDER BY tot_emails DESC
            {}
        """.format("LIMIT $limit" if limit is not None else "")
        results = sesh.run(person_neighbours_query, id=id, limit=limit).values()
        person_neighbours = []
        person_neighbour_counts = []
        for record in results:
            person_neighbours.append(neo4j_node_to_dict(record[0]))
            person_neighbour_counts.append(record[1])

        entity_neighbours_query = """
            PROFILE MATCH (center:Entity)<-[:MENTION]-(emails:Email)-[:MENTION]->(en:Entity)
            WHERE ID(center) = $id
              AND (
                en:Entity_Fac OR
                en:Entity_Gpe OR
                en:Entity_Org OR
                en:Entity_Norp OR
                en:Entity_Person OR
                en:Entity_Money
              )
            RETURN DISTINCT en, count(emails) AS tot_emails
            ORDER BY tot_emails DESC
            {}
        """.format("LIMIT $limit" if limit is not None else "")
        results = sesh.run(entity_neighbours_query, id=id, limit=limit)
        entity_neighbours = []
        entity_neighbour_counts = []
        for record in results:
            entity_neighbours.append(neo4j_node_to_dict(record[0]))
            entity_neighbour_counts.append(record[1])

        if limit is not None:
            desired_num_entities = floor(limit / 2)
            entities_short_by = max(desired_num_entities - len(entity_neighbours), 0)
            person_neighbours = person_neighbours[:ceil(limit / 2) + entities_short_by]
            entity_neighbours = entity_neighbours[:limit - len(person_neighbours)]

        person_relationships = [
            {
                "id": virtual_person_entity_id(person_neighbour["id"], id),
                "type": "DISCUSSED",
                "startNodeId": person_neighbour["id"],
                "endNodeId": id,
                "properties": {
                    "count": person_neighbour_counts[i]
                },
            }
            for i, person_neighbour in enumerate(person_neighbours)
        ]

        entity_relationships = [
            {
                "id": virtual_entity_entity_id(*sorted((id, entity_neighbour["id"]))),
                "type": "APPEAR_WITH",
                "startNodeId": id,
                "endNodeId": entity_neighbour["id"],
                "properties": {
                    "count": entity_neighbour_counts[i]
                },
            }
            for i, entity_neighbour in enumerate(entity_neighbours)
        ]
    neighbours = person_neighbours + entity_neighbours
    relationships = person_relationships + entity_relationships

    return jsonify({
        "neighbours": neighbours,
        "relationships": relationships,
    })


@app.route("/internal_relationships", methods=["GET"])
@cross_origin()
def get_internal_relationships():
    existing_ids = request.args.get('existing_ids').split(",")
    existing_ids = [int(id) for id in existing_ids if id]
    new_ids = request.args.get('new_ids').split(",")
    new_ids = [int(id) for id in new_ids if id]
    existing_ids.extend(new_ids)
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (existing:Person)-[e:EMAILS_WITH]-(new:Person)
            WHERE ID(existing) IN $existing_ids
              AND ID(new) IN $new_ids
            RETURN DISTINCT e
        """, existing_ids=existing_ids, new_ids=new_ids)
        results = query.values()
    return jsonify([neo4j_edge_to_dict(record[0]) for record in results])


@app.route("/emails", methods=["GET"])
@cross_origin()
def get_emails_between():
    if "between" in request.args:
        person_ids = request.args.get("between").split(",")
        if len(person_ids) != 2:
            return jsonify(error=400, text="invalid format for argument `between`. should be a list of 2 ids"), 400
        with driver.session() as sesh:
            query = sesh.run("""
                MATCH (a:Person)<-[:TO]-(e:Email)-[:FROM]->(b:Person)
                WHERE (ID(a) = $id_a AND ID(b) = $id_b) OR (ID(b) = $id_a AND ID(a) = $id_b)
                RETURN DISTINCT e
                ORDER BY e.date DESC
            """, id_a=int(person_ids[0]), id_b=int(person_ids[1]))
            results = query.values()
    elif "email_ids" in request.args:
        email_ids = request.args.get("email_ids").split(",")
        with driver.session() as sesh:
            query = sesh.run("""
                MATCH (e:Email)
                WHERE e.emailId IN $email_ids
                RETURN DISTINCT e
            """, email_ids=email_ids)
            results = query.values()
    else:
        return jsonify(error=400, text="one of `between` or `email_ids` is required in the query string"), 400
    return jsonify([neo4j_node_to_dict(record[0]) for record in results])


@app.route("/entities/<int:id>/emails", methods=["GET"])
@cross_origin()
def get_emails_about_entity(id):
    person_id = request.args.get("person_id", type=int)
    entity_id = request.args.get("entity_id", type=int)
    with driver.session() as sesh:
        if person_id is not None:
            query = sesh.run("""
                MATCH (person:Person)<-[]-(em:Email)-[:MENTION]->(entity:Entity)
                WHERE ID(person) = $person_id AND ID(entity) = $entity_id
                RETURN DISTINCT em
                ORDER BY em.date DESC
            """, person_id=person_id, entity_id=id)
        elif entity_id is not None:
            query = sesh.run("""
                MATCH (ent1:Entity)<-[:MENTION]-(em:Email)-[:MENTION]->(ent2:Entity)
                WHERE ID(ent1) = $entity1_id AND ID(ent2) = $entity2_id
                RETURN DISTINCT em
                ORDER BY em.date DESC
            """, entity1_id=id, entity2_id=entity_id)
        else:
            return jsonify(error=400, text="one of `person_id` or `entity_id` is required in the query string"), 400
        results = query.values()
    return jsonify([neo4j_node_to_dict(record[0]) for record in results])


@app.route("/search", methods=["GET"])
@cross_origin()
def neo4j_search_emails():
    search_terms = request.args.get("q").strip().split()
    limit = request.args.get("limit", type=int, default=25)
    with driver.session() as sesh:
        db_query_persons = sesh.run("""
            MATCH (result:Person)
            WITH result, reduce(acc = 0, x IN $search_terms | acc + CASE WHEN (result.email CONTAINS x) THEN 1 ELSE 0 END) AS hits
            WHERE hits > 0
            RETURN DISTINCT result, hits
            ORDER BY hits DESC
            LIMIT $limit
        """, search_terms=search_terms, limit=ceil(limit / 2))
        db_query_entities = sesh.run("""
            MATCH (result:Entity)
            WITH result, reduce(acc = 0, x IN $search_terms | acc + CASE WHEN (result.name CONTAINS x) THEN 1 ELSE 0 END) AS hits
            WHERE hits > 0
            RETURN DISTINCT result, hits
            ORDER BY hits DESC
            LIMIT $limit
        """, search_terms=search_terms, limit=floor(limit / 2))
        results = db_query_persons.values() + db_query_entities.values()
    return jsonify([neo4j_node_to_dict(record[0]) for record in results])


@app.route("/elasticsearch", methods=["GET"])
@cross_origin()
def es_search_emails():
    search_query = request.args.get("q").strip()
    page_num = request.args.get("page_num", default=1, type=int)
    page_size = request.args.get("page_size", default=50, type=int)
    search_body = {
        "_source": {
            "includes": ["id", "to", "from", "subject", "body", "date"]
        },
        "query": {
            "query_string": {
                "query": search_query
            }
        },
        "from": (page_num - 1) * page_size,
        "size": page_size,
        "highlight": {
            "type": "unified",
            "pre_tags": "<mark>",
            "post_tags": "</mark>",
            "fields": {
                "id": {},
                "to": {},
                "from": {},
                "subject": {},
                "body": {},
                "date": {}
            }
        }
    }
    results = es.search(index="emails", body=search_body)
    return jsonify(results["hits"])


@app.errorhandler(404)
def page_not_found(e):
    return jsonify(error=404, text=str(e)), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0')
