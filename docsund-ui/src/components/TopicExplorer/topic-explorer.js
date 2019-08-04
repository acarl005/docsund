import * as d3 from 'd3v5';
import { fetchJSON } from "../../utils"
import { readFileSync } from "fs"
const defaultWordCloud = readFileSync("./src/components/TopicExplorer/default-word-cloud.png.txt", "utf8")


var plotWordCloud_ = function (wordCloudBytes) {

    if (wordCloudBytes === undefined) {
        var imageByteText = defaultWordCloud;
    } else {
        var imageByteText = wordCloudBytes;
    }
    var wordCloudSvg = d3.select("#word-cloud");
    var wordCloudImg = wordCloudSvg.select("image")
        .attr("xlink:href", "data:image/png;base64," + imageByteText);
};

export const topicExplorer = {
    plotTopicData: function (newTopicData, onSelectTopic) {

        var topicPlotSvg = d3.select("svg#topic-plot");
        var width = 500,
            height = 500;

        var margin = {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
        };

        // Scaling functions
        var calcRadius = function (area) {
            return Math.sqrt(area / Math.PI);
        };

        var xScale = d3.scaleLinear()
            .domain(d3.extent(newTopicData, d => d.x))
            .range([margin.left, width - margin.right]);

        var yScale = d3.scaleLinear()
            .domain(d3.extent(newTopicData, d => d.y))
            .range([height - margin.bottom, margin.top]);

        var radScale = d3.scaleLinear()
            .domain(d3.extent(newTopicData, d => calcRadius(d.size)))
            .range([10, 40]);

        // Calculate the radius
        newTopicData = newTopicData.map(function (d) {
            return {
                radius: radScale(calcRadius(d.size)),
                size: d.size,
                x: xScale(d.x),
                y: yScale(d.y),
                wordcloud: d.wordcloud,
                topic: d.topic
            };
        });

        // Remove pre-existing circles from a potential previous plot
        topicPlotSvg.selectAll("circle").remove();
        topicPlotSvg.selectAll("text").remove();

        // Draw the topic circles
        var standardStrokeColor = "#10885C";
        var hoveredBorderColor = "#4995D6";
        var standardFillColor = "#20C78A";
        var selectedFillColor = "#03afff";
        var transitionDuration = 100;
        var standardStrokeWidth = 1.5;
        var hoveredStrokeWidth = 6;
        var expandedRadiusRatio = 1.4;

        // Plot the topic circles
        var topicCircles = topicPlotSvg.selectAll("circle")
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
            .on("mouseover", function (d) {
                // When hovering over a topic, expand the border and turn it blue
                var boundingCircle = d3.select(this);
                boundingCircle.transition()
                    .duration(transitionDuration)
                    .style("stroke-width", hoveredStrokeWidth)
                    .style("stroke", hoveredBorderColor);
            })
            .on("mouseout", function (d) {
                // When no longer hovering over a topic, return the border to its original state
                var boundingCircle = d3.select(this);
                boundingCircle.transition()
                    .duration(transitionDuration)
                    .style("stroke-width", standardStrokeWidth)
                    .style("stroke", standardStrokeColor);
            })
            .on("click", function (d) {
                // When a topic circle is clicked, increase its size and display its word cloud.
                // Also, return the size of the other topics to their original size, in case a previous
                // topic was clicked.
                topicCircles.transition()
                    .duration(transitionDuration)
                    .attr("r", d => radScale(calcRadius(d.size)))
                    .style("fill", standardFillColor);
                plotWordCloud_(d.wordcloud);
                var boundingCircle = d3.select(this);
                boundingCircle.transition()
                    .duration(transitionDuration)
                    .attr("r", d => expandedRadiusRatio * radScale(calcRadius(d.size)))
                    .style("fill", selectedFillColor);

                onSelectTopic(d.index)
            });

        // Write in the topic circle labels
        var topicLabels = topicPlotSvg.selectAll("text")
            .data(newTopicData)
            .enter()
            .append("text")
            // Add your code below this line
            .text(d => d.topic)
            .attr("text-anchor", "middle")
            .attr("font-family", "Light Sans Regular")
            .attr("font-size", "10px")
            .attr("x", d => d.x)
            .attr("y",  d => d.y);

        // Collision force to prevent topic circle overlap
        var ticked = function () {
            topicCircles.attr("cx", d => d.x)
                .attr("cy", d => d.y);
            topicLabels.attr("x", d => d.x)
                .attr("y", d => d.y);
        };

        var simulation = d3.forceSimulation(newTopicData)
            .force("collide", d3.forceCollide()
                .strength(0.2)
                .radius(d => d.radius + 2))
            .on("tick", ticked);
    },
    createWordCloud: function () {
        var width = 500,
            height = 500;

        var margin = {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
        };

        var wordCloudSvg = d3.select("svg#word-cloud");
        var defaultImageByteText = defaultWordCloud;

        var wordCloudImg = wordCloudSvg.selectAll("image")
            .data([0])
            .enter()
            .append("svg:image")
            .attr("xlink:href", "data:image/png;base64," + defaultImageByteText)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);
    },

    plotWordCloud: function (wordCloudBytes) {

        if (wordCloudBytes === undefined) {
            var imageByteText = defaultWordCloud;
        } else {
            var imageByteText = wordCloudBytes;
        }
        var wordCloudSvg = d3.select("svg#word-cloud");
        var wordCloudImg = wordCloudSvg.select("image")
            .attr("xlink:href", "data:image/png;base64," + imageByteText);
    },
    getTopicsData (numTopics) {
        return fetchJSON(`${TOPIC_API_URL}/TM/topicdistributiondata?numTopics=${numTopics}`)
    },

    getMaxNumTopics() {
        var maxNumTopicsUrl = TOPIC_API_URL + "/TM/nummodels";
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", maxNumTopicsUrl, false);
        xhttp.send();
        var maxNumTopics = parseInt(xhttp.responseText, 10);
        return maxNumTopics;
    },

    getOptimalNumTopics() {
        const optimalNumTopicsUrl = TOPIC_API_URL + "/TM/topics"
        const xhttp = new XMLHttpRequest()
        xhttp.open("GET", optimalNumTopicsUrl, false)
        xhttp.send()
        const resp = JSON.parse(xhttp.responseText)
        return resp.numberOfTopics
    }
};
