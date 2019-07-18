import express from "express"
import proxy from "http-proxy-middleware"

const app = express()

const apiHost = process.env.ENTITIES_API_SERVICE_HOST || "localhost"
const apiPort = process.env.ENTITIES_API_SERVICE_PORT || "5000"
const apiUrl = `http://${apiHost}:${apiPort}`

const topicApiHost = process.env.TOPICS_API_SERVICE_HOST || "localhost"
const topicApiPort = process.env.TOPICS_API_SERVICE_PORT || "5001"
const topicApiUrl = `http://${topicApiHost}:${topicApiPort}`

console.info(`connecting to entities API at ${apiUrl}`)
app.use(proxy("/api", { target: apiUrl, pathRewrite: { "^/api": "" } }))
app.use("/", express.static("dist"))

console.info(`connecting to topics API at ${topicApiUrl}`)
app.use(proxy("/topic-api", { target: topicApiUrl, pathRewrite: { "^/topic-api": "" } }))
app.use("/", express.static("dist"))

const listener = app.listen(1234, () => {
  const { port } = listener.address()
  console.log(`Listening at http://localhost:${port}`)
})
