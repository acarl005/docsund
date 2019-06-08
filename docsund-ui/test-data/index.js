const testData = require("./test-graph.json")

export function findActor(id) {
    return testData.actors.find(actor => actor.id == id)
}

export function findMovie(id) {
    return testData.movies.find(actor => actor.id == id)
}

export function getNeighbours(id) {
  const neighbours = []
  const relationships = []
  if (id in testData.actorToMovieEdges) {
    let movieIds = testData.actorToMovieEdges[id]
    neighbours.push(...testData.movies.filter(movie => movieIds.includes(movie.id)))
    relationships.push(...movieIds.map(movieId => ({
      id: `${id}-${movieId}`,
      startNodeId: id,
      endNodeId: movieId,
      type: "ACTED_IN",
      properties: {}
    })))
  } else if (id in testData.movieToActorEdges) {
    let actorIds = testData.movieToActorEdges[id]
    neighbours.push(...testData.actors.filter(actor => actorIds.includes(actor.id)))
    relationships.push(...actorIds.map(actorId => ({
      id: `${actorId}-${id}`,
      startNodeId: actorId,
      endNodeId: id,
      type: "ACTED_IN",
      properties: {}
    })))
  }

  return [ neighbours, relationships ]
}

export function getInternalRelationships(existingNodeIds, newNodeIds) {
  existingNodeIds = [...existingNodeIds, ...newNodeIds]
  const relationships = []
  for (let oldId of existingNodeIds) {
    for (let newId of newNodeIds) {
      // if this oldId is a movie ID
      if (oldId in testData.actorToMovieEdges) {
        relationships.push(
          ...testData.actorToMovieEdges[oldId]
            .filter(movieId => existingNodeIds.includes(movieId))
            .map(movieId => ({
              id: `${oldId}-${movieId}`,
              startNodeId: oldId,
              endNodeId: movieId,
              type: "ACTED_IN",
              properties: {}
            }))
        )
      } else if (oldId in testData.movieToActorEdges) {
        relationships.push(
          ...testData.movieToActorEdges[oldId]
            .filter(actorId => existingNodeIds.includes(actorId))
            .map(actorId => ({
              id: `${actorId}-${oldId}`,
              startNodeId: actorId,
              endNodeId: oldId,
              type: "ACTED_IN",
              properties: {}
            }))
        )
      }
    }
  }
  return relationships
}

export function search(searchTerms) {
  const searchResults = []
  searchResults.push(
    ...testData.actors.filter(actor =>
      searchTerms.some(term =>
        actor.properties.name.toLowerCase().includes(term)))
  )
  searchResults.push(
    ...testData.movies.filter(movie =>
      searchTerms.some(term =>
        movie.properties.name.toLowerCase().includes(term)))
  )
  return searchResults
}
