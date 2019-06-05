"""
graph.py
by Ryan Delgado

These are functions for turning parsed email data into a network graph based on the senders and recipients. "Parsed"
means that each email is a dictionary with has a single sender and recipient, and has at least these three fields:
    EmailID - unique identifier for an email
    From - email sender
    To - email recipient

Change History:
    2019-06-02 - RD - Creation; Collected & added comments to functions I wrote previously that processes the
        sender/receiver fields into a NetworkX graph and loads them into a neo4j database.

"""


from collections import Counter, defaultdict
import csv
from json import JSONEncoder
import re

import networkx as nx
import numpy as np
import requests

csv.field_size_limit(10000000)


def normalize_parsed_email_csv(file_name='parsed_emails.csv'):
    email_data = []
    with open('parsed_emails.csv', 'r') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            row['To'] = re.sub(r'\n\t', '', row['To'])
            row['EmailID'] = i
            # If there are multiple email recipients, add an entry for each recipient.
            if ',' in row['To']:
                recipients = row['To'].split(',')
                for recipient in recipients:
                    email_data.append({
                        'EmailID': row['EmailID'],
                        'To': recipient.strip(),
                        'From': row['From'],
                        'Body': row['Body'],
                        'Date': row['Date'],
                        'Subject': row['Subject']
                    })
            else:
                email_data.append(row)

    return email_data

def person_counts(emails):
    """Counts the number of times each person appears as either a
    sender or recipient

    Parameters
    ==========
    emails : list of dicts
        Parsed emails with fields EmailID, From, To

    Returns
    =======
    person_counts : collections.Counter
    """
    senders = set((eml['EmailID'], eml['From']) for eml in emails)
    senders = [s[1] for s in senders]
    recipients = set((eml['EmailID'], eml['To']) for eml in emails)
    recipients = [r[1] for r in recipients]
    people = senders + recipients
    person_counts = Counter(people)

    return person_counts


def relationship_counts(emails):
    """Counts the number of relationships between people based on
    senders & receivers, irrespective of who is the sender or receiver"""

    relationships = defaultdict(lambda: 0)
    for eml in emails:
        if eml['To'] != eml['From']:  # Filter out self emails
            key = tuple(sorted([eml['To'], eml['From']]))
            relationships[key] += 1

    relationship_counts = Counter(relationships)

    return relationship_counts


def common_inds_and_rels(person_counts, relationship_counts, num_people=100, num_relationships=100):
    """Determines the most common (as indicated by frequency count) individuals and relationships, and then
    finds the overlap between these individuals and every partner in the relationships. Returns these overlapping
    individuals and relationships as dicts mapping to their frequency counts.

    Parameters
    ===========
    person_counts : collections.Counter
        Contains the frequency counts of the individuals in the network graph
    relationship_counts : collections.Counter
        Contains the frequency counts of the relationships in the network graph
    num_people : integer; default 100
        The number of top individuals to filter to
    num_relationships : integer; default 100
        The number of top relationships to filter to

    Returns
    =======
    common_people : set
        The people found in the most common individual and pairs of most common relationships
    common_individuals : dict
        Maps the most common individuals to their frequency counts; Essentially a filtered person_counts
    common_relationships : dict
        Maps the most common relationships to their frequency counts; Essentially a filtered relationship_counts
    """
    individuals = dict(person_counts.most_common(num_people))
    relationships = dict(relationship_counts.most_common(num_relationships))

    common_relationships = {pair: count for pair, count in relationships.items()
                            if ((pair[0] in individuals) & (pair[1] in individuals))}
    partners = set(person for pair in common_relationships.keys() for person in pair)
    common_individuals = {indiv: count for indiv, count in person_counts.items() if indiv in partners}

    return common_individuals, common_relationships


FREQ_BINS = [0.35, 0.5, 0.5, 0.9]


def bin_dict_vals(dict_to_bin, bins=FREQ_BINS):
    """Bins the values of a dictionary. """
    vals = np.array(list(dict_to_bin.values()))
    quantiles = np.quantile(vals, bins)
    binned = np.digitize(vals, quantiles) + 1

    return dict(zip(dict_to_bin.keys(), binned.tolist()))


def invert_relationship_lengths(relationships):
    max_relstrength = max(relationships.values())
    rels_inverted = {k: (max_relstrength - v) + 1 for k, v in relationships.items()}

    return rels_inverted


def build_email_network_graph(relationships):
    graph = nx.Graph()
    for pair, length in relationships.items():
        graph.add_edge(pair[0], pair[1], length=length)

    return graph


def get_node(node_id, properties):
    """reformats a NetworkX node for `generate_data()`.
    :param node_id: the index of a NetworkX node
    :param properties: a dictionary of node attributes
    :rtype: a dictionary representing a Neo4j POST request
    """
    return {"method": "POST",
            "to": "/node",
            "id": node_id,
            "body": properties}


def relationship_payload(from_id, to_id, rel_name, properties):
    """Reformats a NetworkX edge for encode_graph().

    Parameters
    ==========
    from_id : int
        Index of the NetworkX source node
    to_id : int
        Index of the NetworkX target node
    properties : dict
        Edge attributes

    Returns
    =======
    payload : dict
        POST payload
    """
    body = {"to": "{{{0}}}".format(to_id), "type": rel_name,
            "data": properties}
    payload = {"method": "POST",
               "to": "{{{0}}}/relationships".format(from_id),
               "body": body}
    return payload


def label_payload(i, label):
    """Adds a label to the given (Neo4j) node.

    Parameters
    ==========
    i : int
        Index of the NetworkX node
    label : str
        Label to be given to the node

    Returns
    =======
    payload : dict
        The payload to a POST request
    """
    payload = {"method": "POST",
               "to": "{{{0}}}/labels".format(i),
               "body": label}
    return payload


def encode_graph(graph, edge_rel_name, label, encoder=JSONEncoder()):
    """converts a NetworkX graph into a format that can be uploaded to
    Neo4j using a single HTTP POST request.

    Parameters
    ==========
    graph : networkx.Graph or DiGraph
        The graph to convert
    edge_rel_name : str
        Name of the relationship/edge between nodes
    label : str
        Label to give to each edge
    encoder : json.JSONEncoder
        Encodes the graph data into a JSON.

    Returns
    =======
    graph_encoded : dict
        JSON-encoded graph; <http://docs.neo4j.org/chunked/stable/rest-api-batch-ops.html>.
    """
    is_digraph = isinstance(graph, nx.DiGraph)
    entities = []
    nodes = {}

    for i, (node_name, properties) in enumerate(graph.nodes(data=True)):
        entities.append(get_node(i, properties))
        nodes[node_name] = i

    if label:
        for i in nodes.values():
            entities.append(label_payload(i, label))

    for from_node, to_node, properties in graph.edges(data=True):
        edge = relationship_payload(nodes[from_node], nodes[to_node],
                                    edge_rel_name, properties)
        entities.append(edge)
        if not is_digraph:
            reverse_edge = relationship_payload(nodes[to_node],
                                                nodes[from_node],
                                                edge_rel_name, properties)
            entities.append(reverse_edge)

    return encoder.encode(entities)


RELATIONSHIP_NAME = 'EMAILS_WITH'
PERSON_LABEL = 'PERSON'
DEFAULT_N4J_HOSTPATH = 'http://localhost:7474/db/data/'


def load_graph_to_n4j(graph, hostname=DEFAULT_N4J_HOSTPATH, auth=('', ''),
                      relationship_label=RELATIONSHIP_NAME, node_label=PERSON_LABEL, **kwargs):
    """Batch Loads the NetworkX graph to the Neo4j database using the Neo4j
    REST API endpoint.

    Parameters
    ==========
    graph : networkx.Graph or DiGraph
        Graph to be loaded
    hostname : str
        Hostname of the NetworkX database to be loaded to.
    auth : tuple of strs
        Username and password to use when authenticating with the NetworkX database
    relationship_label : str
        The name to give to the relationship
    node_label : str
        The name to give to the nodes

    Returns
    =======
    response : requests.Response
        The respost from the bulk load POST request
    """

    # Retrieve the batch URL for the Neo4j instance
    graph_encoded = encode_graph(graph, relationship_label, node_label)
    response = requests.get(hostname, auth=auth, **kwargs)
    response.raise_for_status()
    batch_url = response.json()['batch']

    # Batch load via POST request
    response = requests.post(batch_url, data=graph_encoded,
                             headers={'content-type': 'application/json; charset=utf-8'} , **kwargs)

    return response


def parsed_csv_to_neo4j():
    """Function to take the parsed_emails.csv file, transform it into the NetworkX graph, and then load that
    graph into a local neo4j database. For POC use only :)"""
    email_data = normalize_parsed_email_csv('parsed_emails.csv')
    relcouns = relationship_counts(email_data)
    relcounts_binned = bin_dict_vals(relcouns)
    relcounts_binned = invert_relationship_lengths(relcounts_binned)
    graph = build_email_network_graph(relcounts_binned)
    load_graph_to_n4j(graph)