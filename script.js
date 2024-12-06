const margin = { top: 50, right: 50, bottom: 100, left: 100 };
const width = 1300 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(data => {
    const baseTemp = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    const years = [...new Set(monthlyData.map(d => d.year))];
    const months = [...Array(12).keys()];

    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(months)
      .range([0, height])


    const tempExtent = d3.extent(monthlyData, d => d.variance);
    const colorScale = d3.scaleQuantize()
.domain([baseTemp + tempExtent[0], baseTemp + tempExtent[1]])
.range(["#3136b5", "#4575b7", "#74adbb", "#abd9ee", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);


    const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => i % 10 === 0));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => {
      return new Date(0, d).toLocaleString("default", { month: "long" });
    });

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    svg.selectAll(".cell")
      .data(monthlyData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month - 1))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
          .html(`Year: ${d.year}<br>Month: ${new Date(0, d.month - 1).toLocaleString("default", { month: "long" })}<br>Temp: ${(baseTemp + d.variance).toFixed(2)}℃`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px")
          .attr("data-year", d.year);
      })
      .on("mouseout", () => tooltip.style("opacity",0));

    const legendWidth = 400;
    const legendHeight = 20;

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${(width - legendWidth) / 2},${height + 40})`);

    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).tickFormat(d3.format(".1f"));

    legend.selectAll("rect")
      .data(colorScale.range().map(color => {
        const d = colorScale.invertExtent(color);
        return [d[0], d[1]];
      }))
      .enter()
      .append("rect")
      .attr("x", d => legendScale(d[0]))
      .attr("y", 0)
      .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
      .attr("height", legendHeight)
      .attr("fill", d => colorScale(d[0]));

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });