import json
from neo4j import GraphDatabase
from flask import Flask, request
from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "neo4j"))


def json_response(payload, status=200):
    return (json.dumps(payload), status, {"content-type": "application/json"})


def neo4j_node_to_dict(node):
    return {
        "id": node.id,
        "labels": list(node.labels),
        "properties": dict(node),
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
        node = neo4j_node_to_dict(query.single()[0])
        return json_response(node)


@app.route("/neighbours/<id>", methods=["GET"])
@cross_origin()
def get_neighbours(id):
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (center:Person)-[e:EMAILS_WITH]-(neighbours:Person)
            WHERE ID(center) = $id
            RETURN neighbours, e
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
    new_ids = request.args.get('new_ids').split(",")
    print(new_ids, existing_ids)
    existing_ids.extend(new_ids)
    with driver.session() as sesh:
        query = sesh.run("""
            MATCH (existing:Person)-[e:EMAILS_WITH]-(new:Person)
            WHERE ID(existing) IN $existing_ids
              AND ID(new) IN $new_ids
            RETURN e
        """, existing_ids=existing_ids, new_ids=new_ids)
        results = query.values()
        return json_response([neo4j_edge_to_dict(record[0]) for record in results])


if __name__ == '__main__':
    app.run()
