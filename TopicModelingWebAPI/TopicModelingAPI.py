from flask import Flask, json, jsonify, g, request, session, make_response, send_file
from flask_cors import CORS, cross_origin
import os
from TopicModeling import TopicModeling, DocumentTypeEnum

# Topic modeling state
tm =  TopicModeling()

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


@app.route("/TM/archives", methods=["GET"])
@cross_origin()
def ListArchives():
    return json_response({'files': os.listdir('./UploadedFiles')})


@app.route("/TM/archives/<string:archive_name>", methods=["POST"])
@cross_origin()
def SelectArchive(archive_name):
    docType = request.form['type'].lower()

    if docType == 'emails':
        docTypeEnum = DocumentTypeEnum.emailType
    elif docType == 'documents':
        docTypeEnum = DocumentTypeEnum.documentType
    else:
        docTypeEnum = DocumentTypeEnum.unknownType

    if ( tm.setFileToProcess(archive_name, docTypeEnum) ):
        return json_response({})
    else:
        return json_response({}, 404)


@app.route("/TM/ldamodel", methods=["GET"])
@cross_origin()
def BuildModel():
    if tm.modelNotBuiltAndNotBuilding():
        tm.startBuildingModel()
        return json_response({'modelBuilt': False})
    else:
        return json_response({'modelBuilt': tm.getModelBuilt()})


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
