from flask import Flask, json, jsonify, g, request, session, make_response, send_file
import os
from TopicModeling import TopicModeling, DocumentTypeEnum

# Topic modeling state
tm =  TopicModeling()

# The Flask application
app = Flask(__name__)

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


@app.route("/TM/ListFiles", methods=["GET"])
def ListFiles():
    return json_response({'files': os.listdir('./UploadedFiles')})


@app.route("/TM/SelectFile", methods=["POST"])
def SelectFile():
    file = request.form['file']
    docType = request.form['type'].lower()

    if docType == 'emails':
        docTypeEnum = DocumentTypeEnum.emailType
    elif docType == 'documents':
        docTypeEnum = DocumentTypeEnum.documentType
    else:
        docTypeEnum = DocumentTypeEnum.unknownType

    if ( tm.setFileToProcess(file, docTypeEnum) ):
        return json_response({})
    else:
        return json_response({}, 404)


@app.route("/TM/FindNumberOfTopics", methods=["POST"])
def FindNumberOfTopics():
    tm.startFindNumberOfTopics()
    return json_response({})


@app.route("/TM/GetNumberOfTopics", methods=["GET"])
def GetNumberOfTopics():
    success, numTopics = tm.getNumberOfTopics()
    return json_response({'complete': success, 'numberOfTopics': numTopics})


@app.route("/TM/StartBuildingModel", methods=["POST"])
def StartBuildingModel():
    tm.startBuildingModel()
    return json_response({})


@app.route("/TM/GetModelBuilt", methods=["GET"])
def GetModelBuilt():
    return json_response({'modelBuilt': tm.getModelBuilt()})


@app.route("/TM/GetWordsForTopic", methods=["GET"])
def GetWordsForTopic():
    topicId = int(request.args.get('topicId'))
    result, words = tm.getWordsForTopic(topicId)

    if not result:
        return json_response({}, 400)
    else:
        return json_response({'words': words})


@app.route("/TM/GetWordCloudForTopic", methods=["GET"])
def GetWordCloudForTopic():
    topicId = int(request.args.get('topicId'))
    result, filename = tm.getWordCloudForTopic(topicId)

    if not result:
        resp = make_response('', 400)
        resp.headers['mimetype'] = 'image/png'
        return resp
    else:
        return send_file(filename, mimetype='image/png')


@app.route("/TM/GetTopicDistribution", methods=["GET"])
def GetTopicDistribution():
    result, filename = tm.getTopicDistribution()

    if not result:
        resp = make_response('', 400)
        resp.headers['mimetype'] = 'image/png'
        return resp
    else:
        return send_file(filename, mimetype='image/png')


@app.route("/TM/GetDocIDsForTopic", methods=["GET"])
def GetDocIDsForTopic():
    topicId = int(request.args.get('topicId'))
    result, docIDs = tm.getDocIDsForTopic(topicId)

    if not result:
        return json_response({}, 400)
    else:
        return json_response({'docIDs': docIDs})
