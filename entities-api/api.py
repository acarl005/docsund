import json
from neo4j import GraphDatabase
from neotime import DateTime
from flask import Flask, request
from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "neo4j"))


def json_response(payload, status=200):
    return (json.dumps(payload), status, {"content-type": "application/json"})


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


@app.route("/_ping")
def health_check():
    return 'pong'


@app.route("/person/<id>", methods=["GET"])
@cross_origin()
def find_person(id):
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (p:Person)
            WHERE ID(p) = $id
            RETURN p
        """, id=int(id))
        maybe_node = query.single()
        if maybe_node is None:
            return 'person not found', 404
        node = neo4j_node_to_dict(maybe_node[0])
    return json_response(node)


@app.route("/neighbours/<id>", methods=["GET"])
@cross_origin()
def get_neighbours(id):
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (center:Person)-[e:EMAILS_TO]-(neighbours:Person)
            WHERE ID(center) = $id
            RETURN neighbours, e
            ORDER BY e.count DESC
            LIMIT 10
        """, id=int(id))
        results = query.values()
        neighbours = [neo4j_node_to_dict(record[0]) for record in results]
        relationships = [neo4j_edge_to_dict(record[1]) for record in results]
    return json_response({
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
    return json_response([neo4j_edge_to_dict(record[0]) for record in results])


@app.route("/emails", methods=["GET"])
@cross_origin()
def get_emails_between():
    ids = request.args.get("between").split(",")
    if len(ids) != 2:
        raise ValueError("invalid format for argument `between`. should be a list of 2 ids")
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (a:Person)<-[:TO]-(e:Email)-[:FROM]->(b:Person)
            WHERE (ID(a) = $id_a AND ID(b) = $id_b) OR (ID(b) = $id_a AND ID(a) = $id_b)
            RETURN DISTINCT e
            ORDER BY e.date
        """, id_a=int(ids[0]), id_b=int(ids[1]))
        results = query.values()
    return json_response([neo4j_node_to_dict(record[0]) for record in results])


@app.route("/search", methods=["GET"])
@cross_origin()
def search_emails():
    search_terms = request.args.get("q").strip().split()
    with driver.session() as sesh:
        db_query = sesh.run("""
            MATCH (result:Person)
            WHERE reduce(acc = FALSE, x IN $search_terms | acc OR (result.email CONTAINS x))
            RETURN DISTINCT result
        """, search_terms=search_terms)
        results = db_query.values()
    return json_response([neo4j_node_to_dict(record[0]) for record in results])


if __name__ == '__main__':
    print("FUCK")
    app.run(host='0.0.0.0')
