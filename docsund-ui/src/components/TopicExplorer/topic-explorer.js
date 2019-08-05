import * as d3 from "d3v5"
import { readFileSync } from "fs"
import { fetchJSON } from "../../utils"

const defaultWordCloud = readFileSync("./src/components/TopicExplorer/default-word-cloud.png.txt", "utf8")


function plotWordCloud_(wordCloudBytes) {
  let imageByteText
  if (wordCloudBytes === undefined) {
    imageByteText = defaultWordCloud
  } else {
    imageByteText = wordCloudBytes
  }
  const wordCloudSvg = d3.select("#word-cloud")
  wordCloudSvg.select("image").attr("xlink:href", `data:image/png;base64,${imageByteText}`)
}

export default {
  plotTopicData(newTopicData, onSelectTopic) {
    const topicPlotSvg = d3.select("svg#topic-plot")
    const width = 500
    const height = 500

    const margin = {
      left: 50,
      right: 50,
      top: 50,
      bottom: 50
    }

    // Scaling functions
    const calcRadius = function (area) {
      return Math.sqrt(area / Math.PI)
    }

    const xScale = d3.scaleLinear()
      .domain(d3.extent(newTopicData, d => d.x))
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(newTopicData, d => d.y))
      .range([height - margin.bottom, margin.top])

    const radScale = d3.scaleLinear()
      .domain(d3.extent(newTopicData, d => calcRadius(d.size)))
      .range([10, 40])

    // Calculate the radius
    newTopicData = newTopicData.map(d => ({
      radius: radScale(calcRadius(d.size)),
      size: d.size,
      x: xScale(d.x),
      y: yScale(d.y),
      wordcloud: d.wordcloud,
      topic: d.topic
    }))

    // Remove pre-existing circles from a potential previous plot
    topicPlotSvg.selectAll("circle").remove()
    topicPlotSvg.selectAll("text").remove()

    // Draw the topic circles
    const standardStrokeColor = "#10885C"
    const hoveredBorderColor = "#4995D6"
    const standardFillColor = "#20C78A"
    const selectedFillColor = "#03afff"
    const transitionDuration = 100
    const standardStrokeWidth = 1.5
    const hoveredStrokeWidth = 6
    const expandedRadiusRatio = 1.4

    // Plot the topic circles
    const topicCircles = topicPlotSvg.selectAll("circle")
      .data(newTopicData)
      .enter()
      .append("circle")
      .attr("r", d => radScale(calcRadius(d.size)))
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style("stroke", standardStrokeColor)
      .style("fill", standardFillColor)
      .style("opacity", 0.8)
      .style("stroke-width", standardStrokeWidth)
      .on("mouseover", function () {
        // When hovering over a topic, expand the border and turn it blue
        const boundingCircle = d3.select(this)
        boundingCircle.transition()
          .duration(transitionDuration)
          .style("stroke-width", hoveredStrokeWidth)
          .style("stroke", hoveredBorderColor)
      })
      .on("mouseout", function () {
        // When no longer hovering over a topic, return the border to its original state
        const boundingCircle = d3.select(this)
        boundingCircle.transition()
          .duration(transitionDuration)
          .style("stroke-width", standardStrokeWidth)
          .style("stroke", standardStrokeColor)
      })
      .on("click", function (d) {
        // When a topic circle is clicked, increase its size and display its word cloud.
        // Also, return the size of the other topics to their original size, in case a previous
        // topic was clicked.
        topicCircles.transition()
          .duration(transitionDuration)
          .attr("r", d => radScale(calcRadius(d.size)))
          .style("fill", standardFillColor)
        plotWordCloud_(d.wordcloud)
        const boundingCircle = d3.select(this)
        boundingCircle.transition()
          .duration(transitionDuration)
          .attr("r", d => expandedRadiusRatio * radScale(calcRadius(d.size)))
          .style("fill", selectedFillColor)

        onSelectTopic(d.index)
      })

    // Write in the topic circle labels
    const topicLabels = topicPlotSvg.selectAll("text")
      .data(newTopicData)
      .enter()
      .append("text")
    // Add your code below this line
      .text(d => d.topic)
      .attr("text-anchor", "middle")
      .attr("font-family", "Light Sans Regular")
      .attr("font-size", "10px")
      .attr("x", d => d.x)
      .attr("y", d => d.y)

    // Collision force to prevent topic circle overlap
    const ticked = function () {
      topicCircles.attr("cx", d => d.x)
        .attr("cy", d => d.y)
      topicLabels.attr("x", d => d.x)
        .attr("y", d => d.y)
    }

    d3.forceSimulation(newTopicData)
      .force("collide", d3.forceCollide()
        .strength(0.2)
        .radius(d => d.radius + 2))
      .on("tick", ticked)
  },
  createWordCloud() {
    const width = 500
    const height = 500

    const wordCloudSvg = d3.select("svg#word-cloud")
    const defaultImageByteText = defaultWordCloud

    wordCloudSvg.selectAll("image")
      .data([0])
      .enter()
      .append("svg:image")
      .attr("xlink:href", `data:image/png;base64,${defaultImageByteText}`)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
  },

  plotWordCloud(wordCloudBytes) {
    let imageByteText
    if (wordCloudBytes === undefined) {
      imageByteText = defaultWordCloud
    } else {
      imageByteText = wordCloudBytes
    }
    const wordCloudSvg = d3.select("svg#word-cloud")
    wordCloudSvg.select("image").attr("xlink:href", `data:image/png;base64,${imageByteText}`)
  },

  getTopicsData(numTopics) {
    return fetchJSON(`${TOPIC_API_URL}/TM/topicdistributiondata?numTopics=${numTopics}`)
  },

  getMaxNumTopics() {
    const maxNumTopicsUrl = `${TOPIC_API_URL}/TM/nummodels`
    const xhttp = new XMLHttpRequest()
    xhttp.open("GET", maxNumTopicsUrl, false)
    xhttp.send()
    const maxNumTopics = parseInt(xhttp.responseText, 10)
    return maxNumTopics
  },

  getOptimalNumTopics() {
    const optimalNumTopicsUrl = `${TOPIC_API_URL}/TM/topics`
    const xhttp = new XMLHttpRequest()
    xhttp.open("GET", optimalNumTopicsUrl, false)
    xhttp.send()
    const resp = JSON.parse(xhttp.responseText)
    return resp.numberOfTopics
  }
}
