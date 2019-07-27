import * as d3 from 'd3v5';


var plotWordCloud_ = function (wordCloudBytes) {

    if (wordCloudBytes === undefined) {
        var imageByteText = "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\n6VF1p9wzKbfOys3X8h3lhRn5easdNR06yH/SYvwLL2sP2jzWbOnGfNvarSfIHXavNzf6urywbsim\n77Gra+XiTWM3WSrV1Ka1eYtxLhdLN+bb1m69d9nemzkvyP2M1U3lHap1n+HDveWkNPwlkbJT13V6\nTTZdr7hlojd2Z1NznUuRx/O4OEz1glt76ryRTeMWXx4qwyH4GFZ0vZx0xfX96TSUuyY/pRLJ3FdX\nTac/Blb/u3jpT3BdplMme3Nj+utcY6s0rfnm+2UdsXO9183mhvOKZ9t//qxsx7DG9Bd+kuEclq7S\n7Wct8tQ6p3bpvnR4rqe8/GL6y4uKh37TZenKS6dTZw21vzq76aX7+YMxzp6cTeU8zwueVtzz2wM7\nsqmrzrcP/YVh0r7Wa5wcqHP9e7rSx3onY6HaCttd07KP94/J6duehY7KPbcPxJXL083tc9mhe71Z\nbtaZJWOj5YNWDsepSy1LO1bntYWW/a1UoJzMctXY5vJIm47tYidTy9tyjQ+j6QH0nHNRzvPDNtUf\nqDdW6rxqZ52rw9QuOFbnhp833R6BB+nutfvu9dU0D7zS9+qsFlvlge/GHa5snfhOfeud5WZdcxub\nrI8z3n3uYg/XebGDWb53u3RXdUof3jwCSvulHnKzla7LndsD77O5pM1J3eu6eH+dq3uwPY+jdW75\nWXiZ4vLq0p0b/d/qqenuwuTbb29e6qxr5vv0rPdKbrZ2mpbk9W2Nk/o8d7XH6rx05a36FVOdvocr\nH6uVf8TxUMPantSH3af0u7KrZVaNm15bw5Ujda623ZrH8Tq3ZNM0zlLd0ggb3d/pqOn6kLOV3pYW\nXS696W64rX3m+3Ss91rD2u/kNW+2+Pk676dqoyN1Lm23l1i9qIw2aK5w6XOjwdKyTlA5CtNS2ja9\n0tnFsTpXS7E+jzPq3JZNZRLLs69XaNZc06Yr19afb7+ebOnt5tLhtraDcED7em/kZl2zm0d68oqu\n7a9z2bnaCmuXTcO113ftyFwpl/Tu2baGcf8dvsxrfbpu3u3y+ZqDda6WYnUeDeutdt6aTWUW97NP\n/VcLdKW1pqvVurFagPvJDhd+fH2NN87Xjrdtb9lxzeu9tVzsbVMxBh/pZ4/PXlqyt87TXKt1KfVb\nq0R/nSodJmVyvXu2rWHcHqW72hyP1rlaitV5nFLn1mwqo90OlrqvrvtaY00va5ueZ100PTn5WIHc\nfBpmmOZwSa7FdG331HdpXu+tpVo3SE/I5Ypk4/PFnX302VnnfElDXSoXdtepZeByTXVuPZoX3Kjx\nXB2tc7UUa/NoGbjaeXs2LRyEoffOx09jTecLt7Np9jCHvO5pckNnacSbBZTbnqx5vbduZtrr5z6i\n8tdR5d5z7axzKUt9gZUz3l2nSn+jck3vnm1qGbdHKWCtu6N1rpZibR7n1Lk9mx4mMnzecSxGjTXt\nqOqKvPDcfOgrD5g7HT/eMfc9mtd7Kzc7OMGrF72NnrLefXUux7I+o8oZ765Tpb9RuaZ3zza1jNsj\nL7za3dE6V0uxNo+W9VY778mmu5ksH7ttjTVtW9ymPFJqPnRV5pk7TZ9cbnuu5vXeys1OmuGQUbmW\nB6q5bled8wUN8yn1W6tEf50qHSZlcufWqmHcHqW72hyP1rlaitV5nFLnnmy6mcrwcX+lV9fyoGFx\n23IHwzczVw+PXI7h0+HOhjkc177eG7lZx9rTK3nKh8sOl3PVrjqXc1mbTu2y7jq1DFwuOfd8lE5b\nev1peBqjbGe1t4N1rpZidR4NA1c778umq7kMH/WciaK1poPGS1dftZOXPj5tdOkjd/r5+aJo6lnv\ntdxssb7fnws/O0prrYwxlaN7y2r21bl+MJONOoxq9y8oA2+02blnFWXcarfDdQ3raZ7jsTrXWm8s\nqtx1qM592TR3OJy6riNR9Ox7uXZ7mOGitc6mwl1fMN+2Z/I79Kz3yvqZ+P78WOosjVMZZJzKM5a9\ns865NFsTWq/CpN7Ho9LrWqOl1Zxi6ni732FFLcvJC2+a46E6bzcus1huekKdO7Npez5VHTUdlKtX\n65rWt1H0peaVip2tb70XeZoPsxxuXp55Hmfr2bixx+cse2+dK5Oe7i6fLsmX9K6qzHep5zTt8juo\n59eq1GR9SePoTcNuLOHRgTpvTHm4a/p13ZXGh+vcm019ZbnX27j8nvT4i8y3S0hPlKeby6eLxsZ3\na1+67Xl2F2s+FF/TuvOPtFd6mi4fVrZ0BMdiPW/Vu+tcpv34sMkTXrjjRmnev675WF1XKxV4fLXF\nXMv0HjXnvkAsL+tu4FFecetB6TxXB+pcRhpfzZPesikpTwAPo0/3llotdJ/v3Vfn7mzKC21+tA2L\nv8hzGZVbkkpfpX7XjcaP678dtjjTVK7m2fc7vt7JvHeTtJ/lvnvjteMej4OOHxX5hqe+CPNQnR/e\nV2iY8vpi09Wz4bJJuSVpLu/Vscr/5BOVa5nfwnCQrz7P1XGeZz1+vLlFN8dqbj8ot4w2V95X5yvX\nE55MrdIm5x5XS3Wgzv3ZNP5+d2U919LAm8p1FempqPF9xVJpW4dfmmnf7PuVVa0r1zWZ3i6wt1Vp\nlho+dbHF4TqnCX+l7R13d6vdWMIt5bo2++p7gnnBree5rG5LuXJLe53vzCdqX6V21XlHNgE8nWwC\nIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFs\nAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCR\nbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQ\nkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQT\nEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhk\nExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CI\nZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuA\niGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSb\ngIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQk\nm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QRE\nJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkE\nRCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUA8//77HxTQF2dIEXuk\nAAAAAElFTkSuQmCC\n";
    } else {
        var imageByteText = wordCloudBytes;
    }
    var wordCloudSvg = d3.select("#word-cloud");
    var wordCloudImg = wordCloudSvg.select("image")
        .attr("xlink:href", "data:image/png;base64," + imageByteText);
};

export const topicExplorer = {
    plotTopicData: function (newTopicData) {

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
        var transitionDuration = 100;
        var standardStrokeWidth = 1.5;
        var hoveredStrokeWidth = 6;
        var expandedRadiusRatio = 1.2;

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
                    .attr("r", d => radScale(calcRadius(d.size)));
                plotWordCloud_(d.wordcloud);
                var boundingCircle = d3.select(this);
                boundingCircle.transition()
                    .duration(transitionDuration)
                    .attr("r", d => expandedRadiusRatio * radScale(calcRadius(d.size)));
            });

        // Write in the topic circle labels
        var topicLabels = topicPlotSvg.selectAll("text")
            .data(newTopicData)
            .enter()
            .append("text")
            // Add your code below this line
            .text(d => d.topic)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
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
        var defaultImageByteText = "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\n6VF1p9wzKbfOys3X8h3lhRn5easdNR06yH/SYvwLL2sP2jzWbOnGfNvarSfIHXavNzf6urywbsim\n77Gra+XiTWM3WSrV1Ka1eYtxLhdLN+bb1m69d9nemzkvyP2M1U3lHap1n+HDveWkNPwlkbJT13V6\nTTZdr7hlojd2Z1NznUuRx/O4OEz1glt76ryRTeMWXx4qwyH4GFZ0vZx0xfX96TSUuyY/pRLJ3FdX\nTac/Blb/u3jpT3BdplMme3Nj+utcY6s0rfnm+2UdsXO9183mhvOKZ9t//qxsx7DG9Bd+kuEclq7S\n7Wct8tQ6p3bpvnR4rqe8/GL6y4uKh37TZenKS6dTZw21vzq76aX7+YMxzp6cTeU8zwueVtzz2wM7\nsqmrzrcP/YVh0r7Wa5wcqHP9e7rSx3onY6HaCttd07KP94/J6duehY7KPbcPxJXL083tc9mhe71Z\nbtaZJWOj5YNWDsepSy1LO1bntYWW/a1UoJzMctXY5vJIm47tYidTy9tyjQ+j6QH0nHNRzvPDNtUf\nqDdW6rxqZ52rw9QuOFbnhp833R6BB+nutfvu9dU0D7zS9+qsFlvlge/GHa5snfhOfeud5WZdcxub\nrI8z3n3uYg/XebGDWb53u3RXdUof3jwCSvulHnKzla7LndsD77O5pM1J3eu6eH+dq3uwPY+jdW75\nWXiZ4vLq0p0b/d/qqenuwuTbb29e6qxr5vv0rPdKbrZ2mpbk9W2Nk/o8d7XH6rx05a36FVOdvocr\nH6uVf8TxUMPantSH3af0u7KrZVaNm15bw5Ujda623ZrH8Tq3ZNM0zlLd0ggb3d/pqOn6kLOV3pYW\nXS696W64rX3m+3Ss91rD2u/kNW+2+Pk676dqoyN1Lm23l1i9qIw2aK5w6XOjwdKyTlA5CtNS2ja9\n0tnFsTpXS7E+jzPq3JZNZRLLs69XaNZc06Yr19afb7+ebOnt5tLhtraDcED7em/kZl2zm0d68oqu\n7a9z2bnaCmuXTcO113ftyFwpl/Tu2baGcf8dvsxrfbpu3u3y+ZqDda6WYnUeDeutdt6aTWUW97NP\n/VcLdKW1pqvVurFagPvJDhd+fH2NN87Xjrdtb9lxzeu9tVzsbVMxBh/pZ4/PXlqyt87TXKt1KfVb\nq0R/nSodJmVyvXu2rWHcHqW72hyP1rlaitV5nFLn1mwqo90OlrqvrvtaY00va5ueZ100PTn5WIHc\nfBpmmOZwSa7FdG331HdpXu+tpVo3SE/I5Ypk4/PFnX302VnnfElDXSoXdtepZeByTXVuPZoX3Kjx\nXB2tc7UUa/NoGbjaeXs2LRyEoffOx09jTecLt7Np9jCHvO5pckNnacSbBZTbnqx5vbduZtrr5z6i\n8tdR5d5z7axzKUt9gZUz3l2nSn+jck3vnm1qGbdHKWCtu6N1rpZibR7n1Lk9mx4mMnzecSxGjTXt\nqOqKvPDcfOgrD5g7HT/eMfc9mtd7Kzc7OMGrF72NnrLefXUux7I+o8oZ765Tpb9RuaZ3zza1jNsj\nL7za3dE6V0uxNo+W9VY778mmu5ksH7ttjTVtW9ymPFJqPnRV5pk7TZ9cbnuu5vXeys1OmuGQUbmW\nB6q5bled8wUN8yn1W6tEf50qHSZlcufWqmHcHqW72hyP1rlaitV5nFLnnmy6mcrwcX+lV9fyoGFx\n23IHwzczVw+PXI7h0+HOhjkc177eG7lZx9rTK3nKh8sOl3PVrjqXc1mbTu2y7jq1DFwuOfd8lE5b\nev1peBqjbGe1t4N1rpZidR4NA1c778umq7kMH/WciaK1poPGS1dftZOXPj5tdOkjd/r5+aJo6lnv\ntdxssb7fnws/O0prrYwxlaN7y2r21bl+MJONOoxq9y8oA2+02blnFWXcarfDdQ3raZ7jsTrXWm8s\nqtx1qM592TR3OJy6riNR9Ox7uXZ7mOGitc6mwl1fMN+2Z/I79Kz3yvqZ+P78WOosjVMZZJzKM5a9\ns865NFsTWq/CpN7Ho9LrWqOl1Zxi6ni732FFLcvJC2+a46E6bzcus1huekKdO7Npez5VHTUdlKtX\n65rWt1H0peaVip2tb70XeZoPsxxuXp55Hmfr2bixx+cse2+dK5Oe7i6fLsmX9K6qzHep5zTt8juo\n59eq1GR9SePoTcNuLOHRgTpvTHm4a/p13ZXGh+vcm019ZbnX27j8nvT4i8y3S0hPlKeby6eLxsZ3\na1+67Xl2F2s+FF/TuvOPtFd6mi4fVrZ0BMdiPW/Vu+tcpv34sMkTXrjjRmnev675WF1XKxV4fLXF\nXMv0HjXnvkAsL+tu4FFecetB6TxXB+pcRhpfzZPesikpTwAPo0/3llotdJ/v3Vfn7mzKC21+tA2L\nv8hzGZVbkkpfpX7XjcaP678dtjjTVK7m2fc7vt7JvHeTtJ/lvnvjteMej4OOHxX5hqe+CPNQnR/e\nV2iY8vpi09Wz4bJJuSVpLu/Vscr/5BOVa5nfwnCQrz7P1XGeZz1+vLlFN8dqbj8ot4w2V95X5yvX\nE55MrdIm5x5XS3Wgzv3ZNP5+d2U919LAm8p1FempqPF9xVJpW4dfmmnf7PuVVa0r1zWZ3i6wt1Vp\nlho+dbHF4TqnCX+l7R13d6vdWMIt5bo2++p7gnnBree5rG5LuXJLe53vzCdqX6V21XlHNgE8nWwC\nIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFs\nAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCR\nbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQ\nkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQT\nEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhk\nExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CI\nZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuA\niGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSb\ngIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQk\nm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QRE\nJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkE\nRCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUA8//77HxTQF2dIEXuk\nAAAAAElFTkSuQmCC\n";

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
            var imageByteText = "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\n6VF1p9wzKbfOys3X8h3lhRn5easdNR06yH/SYvwLL2sP2jzWbOnGfNvarSfIHXavNzf6urywbsim\n77Gra+XiTWM3WSrV1Ka1eYtxLhdLN+bb1m69d9nemzkvyP2M1U3lHap1n+HDveWkNPwlkbJT13V6\nTTZdr7hlojd2Z1NznUuRx/O4OEz1glt76ryRTeMWXx4qwyH4GFZ0vZx0xfX96TSUuyY/pRLJ3FdX\nTac/Blb/u3jpT3BdplMme3Nj+utcY6s0rfnm+2UdsXO9183mhvOKZ9t//qxsx7DG9Bd+kuEclq7S\n7Wct8tQ6p3bpvnR4rqe8/GL6y4uKh37TZenKS6dTZw21vzq76aX7+YMxzp6cTeU8zwueVtzz2wM7\nsqmrzrcP/YVh0r7Wa5wcqHP9e7rSx3onY6HaCttd07KP94/J6duehY7KPbcPxJXL083tc9mhe71Z\nbtaZJWOj5YNWDsepSy1LO1bntYWW/a1UoJzMctXY5vJIm47tYidTy9tyjQ+j6QH0nHNRzvPDNtUf\nqDdW6rxqZ52rw9QuOFbnhp833R6BB+nutfvu9dU0D7zS9+qsFlvlge/GHa5snfhOfeud5WZdcxub\nrI8z3n3uYg/XebGDWb53u3RXdUof3jwCSvulHnKzla7LndsD77O5pM1J3eu6eH+dq3uwPY+jdW75\nWXiZ4vLq0p0b/d/qqenuwuTbb29e6qxr5vv0rPdKbrZ2mpbk9W2Nk/o8d7XH6rx05a36FVOdvocr\nH6uVf8TxUMPantSH3af0u7KrZVaNm15bw5Ujda623ZrH8Tq3ZNM0zlLd0ggb3d/pqOn6kLOV3pYW\nXS696W64rX3m+3Ss91rD2u/kNW+2+Pk676dqoyN1Lm23l1i9qIw2aK5w6XOjwdKyTlA5CtNS2ja9\n0tnFsTpXS7E+jzPq3JZNZRLLs69XaNZc06Yr19afb7+ebOnt5tLhtraDcED7em/kZl2zm0d68oqu\n7a9z2bnaCmuXTcO113ftyFwpl/Tu2baGcf8dvsxrfbpu3u3y+ZqDda6WYnUeDeutdt6aTWUW97NP\n/VcLdKW1pqvVurFagPvJDhd+fH2NN87Xjrdtb9lxzeu9tVzsbVMxBh/pZ4/PXlqyt87TXKt1KfVb\nq0R/nSodJmVyvXu2rWHcHqW72hyP1rlaitV5nFLn1mwqo90OlrqvrvtaY00va5ueZ100PTn5WIHc\nfBpmmOZwSa7FdG331HdpXu+tpVo3SE/I5Ypk4/PFnX302VnnfElDXSoXdtepZeByTXVuPZoX3Kjx\nXB2tc7UUa/NoGbjaeXs2LRyEoffOx09jTecLt7Np9jCHvO5pckNnacSbBZTbnqx5vbduZtrr5z6i\n8tdR5d5z7axzKUt9gZUz3l2nSn+jck3vnm1qGbdHKWCtu6N1rpZibR7n1Lk9mx4mMnzecSxGjTXt\nqOqKvPDcfOgrD5g7HT/eMfc9mtd7Kzc7OMGrF72NnrLefXUux7I+o8oZ765Tpb9RuaZ3zza1jNsj\nL7za3dE6V0uxNo+W9VY778mmu5ksH7ttjTVtW9ymPFJqPnRV5pk7TZ9cbnuu5vXeys1OmuGQUbmW\nB6q5bled8wUN8yn1W6tEf50qHSZlcufWqmHcHqW72hyP1rlaitV5nFLnnmy6mcrwcX+lV9fyoGFx\n23IHwzczVw+PXI7h0+HOhjkc177eG7lZx9rTK3nKh8sOl3PVrjqXc1mbTu2y7jq1DFwuOfd8lE5b\nev1peBqjbGe1t4N1rpZidR4NA1c778umq7kMH/WciaK1poPGS1dftZOXPj5tdOkjd/r5+aJo6lnv\ntdxssb7fnws/O0prrYwxlaN7y2r21bl+MJONOoxq9y8oA2+02blnFWXcarfDdQ3raZ7jsTrXWm8s\nqtx1qM592TR3OJy6riNR9Ox7uXZ7mOGitc6mwl1fMN+2Z/I79Kz3yvqZ+P78WOosjVMZZJzKM5a9\ns865NFsTWq/CpN7Ho9LrWqOl1Zxi6ni732FFLcvJC2+a46E6bzcus1huekKdO7Npez5VHTUdlKtX\n65rWt1H0peaVip2tb70XeZoPsxxuXp55Hmfr2bixx+cse2+dK5Oe7i6fLsmX9K6qzHep5zTt8juo\n59eq1GR9SePoTcNuLOHRgTpvTHm4a/p13ZXGh+vcm019ZbnX27j8nvT4i8y3S0hPlKeby6eLxsZ3\na1+67Xl2F2s+FF/TuvOPtFd6mi4fVrZ0BMdiPW/Vu+tcpv34sMkTXrjjRmnev675WF1XKxV4fLXF\nXMv0HjXnvkAsL+tu4FFecetB6TxXB+pcRhpfzZPesikpTwAPo0/3llotdJ/v3Vfn7mzKC21+tA2L\nv8hzGZVbkkpfpX7XjcaP678dtjjTVK7m2fc7vt7JvHeTtJ/lvnvjteMej4OOHxX5hqe+CPNQnR/e\nV2iY8vpi09Wz4bJJuSVpLu/Vscr/5BOVa5nfwnCQrz7P1XGeZz1+vLlFN8dqbj8ot4w2V95X5yvX\nE55MrdIm5x5XS3Wgzv3ZNP5+d2U919LAm8p1FempqPF9xVJpW4dfmmnf7PuVVa0r1zWZ3i6wt1Vp\nlho+dbHF4TqnCX+l7R13d6vdWMIt5bo2++p7gnnBree5rG5LuXJLe53vzCdqX6V21XlHNgE8nWwC\nIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFs\nAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCR\nbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQ\nkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQT\nEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhk\nExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CI\nZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuA\niGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSb\ngIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQk\nm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkERCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QRE\nJJuAiGQTEJFsAiKSTUBEsgmISDYBEckmICLZBEQkm4CIZBMQkWwCIpJNQESyCYhINgERySYgItkE\nRCSbgIhkExCRbAIikk1ARLIJiEg2ARHJJiAi2QREJJuAiGQTEJFsAiKSTUA8//77HxTQF2dIEXuk\nAAAAAElFTkSuQmCC\n";
        } else {
            var imageByteText = wordCloudBytes;
        }
        var wordCloudSvg = d3.select("svg#word-cloud");
        var wordCloudImg = wordCloudSvg.select("image")
            .attr("xlink:href", "data:image/png;base64," + imageByteText);
    },
    api: function () {
        // ToDo: Add labels to the plots
        var rootUrl = "http://127.0.0.1:5000";
        var setNumTopicsUrl = rootUrl + "/tm/setnumtopics/";
        var setNumTopWordsUrl = rootUrl + "/tm/setnumtopwords/";
        var buildTopicModelUrl = rootUrl + "/tm/buildmodel";
        var getWordCloudUrl = rootUrl + "/tm/wordcloud/";
        var getTopicsCoordinatesUrl = rootUrl + "/tm/topiccoords";
        var getTopicsDataUrl = rootUrl + "/tm/topicsdata/";

        var setNumTopics_ = function (numTopics) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", setNumTopicsUrl + numTopics, false);
            xhttp.send();
            return JSON.parse(xhttp.responseText);
        };

        var setNumTopWords_ = function (numTopWords) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", setNumTopWordsUrl + numTopWords, false);
            xhttp.send();
            return JSON.parse(xhttp.responseText);
        };

        var buildTopicModel_ = function () {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", buildTopicModelUrl, false);
            xhttp.send();
            return JSON.parse(xhttp.responseText);
        };

        var getWordCloudImage_ = function (topicNum) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", getWordCloudUrl + topicNum, false);
            xhttp.send();
            var wordCloudEncodedImage = JSON.parse(xhttp.responseText);
            return wordCloudEncodedImage;
        };

        var getTopicsCoordinates_ = function () {
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", getTopicsCoordinatesUrl, false);
            xhttp.send();
            var topicCoordinates = JSON.parse(xhttp.responseText);
            return topicCoordinates;
        };

        var getTopicsData_ = function (numTopics) {
            var topicDataUrl = getTopicsDataUrl + numTopics;
            // fetch(topicDataUrl, {
            //     mode: 'cors',
            //     method: 'GET'
            // })
            // .then(function(response) {
            //     return JSON.stringify(response.json());
            // });
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", topicDataUrl, false);
            xhttp.send();
            var topicsData = JSON.parse(xhttp.responseText);
            return topicsData;


        };


        var public_ = {
            "setNumTopics": setNumTopics_,
            "setNumTopWords": setNumTopWords_,
            "buildTopicModel": buildTopicModel_,
            "getWordCloudImage": getWordCloudImage_,
            "getTopicCoordinates": getTopicsCoordinates_,
            "getTopicsData": getTopicsData_
        };

        return public_;
    }

};

// ToDo: Figure out how to style and intuitively arrange the SVGs and input & button.

