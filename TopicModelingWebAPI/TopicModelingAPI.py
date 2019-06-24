from flask import Flask, json, jsonify, g, request, session, make_response, send_file
from flask_cors import CORS, cross_origin
import os
from TopicModeling import TopicModeling, DocumentTypeEnum

# Topic modeling state
tm = TopicModeling()

# The Flask application
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def json_response(payload, status=200):
    """
    Returns the payload encoded as JSON to the client, and sets the HTTP status code.

    Args:
        payload: data to be encoded as JSON
        status: HTTP status code

    Returns:
        The payload serialized as JSON

    Raises:
        None
    """
    return (json.dumps(payload), status, {'content-type': 'application/json'})


@app.route("/TM/ldamodel", methods=["GET"])
@cross_origin()
def GetModel():
    if tm.modelBuilding():
        return json_response({'modelBuilt': False, 'modelBuilding': True})
    else:
        return json_response({'modelBuilt': tm.getModelBuilt(), 'modelBuilding': False})


@app.route("/TM/ldamodel", methods=["POST"])
@cross_origin()
def BuildModel():
    if tm.modelBuilding():
        return json_response({'modelBuilt': False, 'modelBuilding': True})
    else:
        tm.startBuildingModel()
        return json_response({'modelBuilt': False, 'modelBuilding': True})


@app.route("/TM/topics", methods=["GET"])
@cross_origin()
def GetNumberOfTopics():
    success, numTopics = tm.getNumberOfTopics()
    return json_response({'complete': success, 'numberOfTopics': numTopics})


@app.route("/TM/topics/<int:num_topics>", methods=["POST"])
@cross_origin()
def SetNumberOfTopics(num_topics):
    success = tm.setNumberOfTopics(num_topics)
    if not success:
        return json_response({}, 400)
    else:
        return json_response({})


@app.route("/TM/stopwords", methods=["POST"])
@cross_origin()
def SetStopWords():
    stopWords = request.form['stopWords']
    success = tm.setUserStopList(stopWords)
    if not success:
        return json_response({}, 400)
    else:
        return json_response({})


@app.route("/TM/topics/<int:topic_id>", methods=["GET"])
@cross_origin()
def GetWordCloudForTopic(topic_id):
    result, encodedImage = tm.getWordCloudForTopic(topic_id)

    if not result:
        resp = make_response('', 400)
        resp.headers['mimetype'] = 'image/png'
        return resp
    else:
        return (encodedImage, 200, {'content-type': 'text/plain'})


@app.route("/TM/topicdistribution", methods=["GET"])
@cross_origin()
def GetTopicDistribution():
    result, encodedImage = tm.getTopicDistribution()

    if not result:
        resp = make_response('', 400)
        resp.headers['mimetype'] = 'image/png'
        return resp
    else:
        return (encodedImage, 200, {'content-type': 'text/plain'})


@app.route("/TM/topics/<int:topic_id>/documents", methods=["GET"])
@cross_origin()
def GetDocIDsForTopic(topic_id):
    result, docIDs = tm.getDocIDsForTopic(topic_id)

    if not result:
        return json_response({}, 400)
    else:
        return json_response({'docIDs': docIDs})
