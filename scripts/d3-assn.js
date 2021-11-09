var screenWidth = 1300;
var screenHeight = window.screen.height;
var svg;
var shoWRegionNames = false;
var dataPointsApi;

// Range Slider
const rangeInput = document.querySelector(".range-wrap .range");
let rangeValue = document.querySelector(".range-wrap .value div");

let start = parseFloat(rangeInput.min);
let end = parseFloat(rangeInput.max);
let step = parseFloat(rangeInput.step);

for (let i = start; i <= end; i += step) {
    rangeValue.innerHTML += '<div>' + i + '</div>';
}
rangeInput.addEventListener("input", function () {
    let top = parseFloat(rangeInput.value) / step * -40;
    rangeValue.style.marginTop = top + "px";
});

// Creating Projection of Map with customizations
var projection = d3.geoAlbers().center([1.5, 55.2]).rotate([4.4, 0]).parallels([50, 50]).scale(5000).translate([screenWidth / 2, screenHeight / 2]);
var path = d3.geoPath().projection(projection);

// load data on Page Load
function loadData(towns) {
    var countryData = d3.json("./ukcounties.geojson");
    // console.log(towns);
    var regionPoint = d3.json("http://35.233.33.123/Circles/Towns/" + towns);
    Promise.all([countryData, regionPoint]).then(function (data, error) {
        if (data) {
            let cData = [];
            cData = data[1];
            drawData(data[0], cData);
        } else {
            console.log("error occured")
        }
    })
}

// Load More Regions on Button Click
function loadRegionNewData() {
    console.log(document.querySelector(".range").value);
    this.towns = document.querySelector(".range").value;
    this.loadData(towns);
}
// Showing Region Names on Map
function showRegionNames() {
    this.shoWRegionNames = true;
    showCirclesData(this.dataPointsApi, true);
}
// Creating SVG of Map
function createSvg() {
    svg = d3.select("div#content").append("svg").style("background-color", "#c9e8fd")
        .attr("viewBox", "0 0 " + screenWidth + " " + screenHeight)
        .classed("svg-content", true)

    svg
        .transition()
        .duration(700)
        .attr('class', 'country')
        .attr('width', 900)
        .attr('height', 700)
}

// Drawing Circles on Map
function drawCircles(mapData, dataPoints) {
    this.dataPointsApi = dataPoints
    svg.selectAll("path")
        .data(mapData.features)
        .enter().append("path")
        .attr("class", "continent")
        .attr("d", path)
        .append("title")
        .text((d) => d.properties.name)

    showCirclesData(dataPoints, false)
}

function showCirclesData(dataPoints, showNames) {
    // Points on map
    if (document.contains(document.getElementById("tooltip1"))) {
        document.getElementById("tooltip1").remove();
    }
    var Tooltip = d3.select("div#main-content .info")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip1")
        .style("opacity", 1)
        .style("background-color", "paleturquoise")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("box-shadow", "rgb(0 0 0 / 25%) 0px 20px 40px -14px")

    // Showing Region Details of Hover
    const mouseover = function (event, d) {
        Tooltip
            .style("opacity", 1)
            .style("transition", "all .5s ease")

    }
    var mousemove = function (event, d) {
        Tooltip
            .html("<b>" + d.County + "<b>" + "<br>" + "Population: " + d.Population + "<br>" + "Longitude: " + d.lng + "<br>" + "Latitude: " + d.lat)
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 - 30 + "px")
    }
    // var mouseleave = function (event, d) {
    //     Tooltip.style("opacity", 0)
    // }
    let g = svg.append("g");
    if (!showNames) {
        g.selectAll("circle")
            .data(dataPoints)
            .enter()
            .append("circle")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            // .on("mouseleave", mouseleave)
            .transition()
            .duration(1000)
            .attr("cx", function (d) {
                return projection([d.lng, d.lat])[0] + 5;
            })
            .attr("cy", function (d) {
                return projection([d.lng, d.lat])[1] + 15;
            })
            .attr("r", (d) => {
                return (d.Population / 10500)
            })
    } else {
        g.selectAll("circle")
            .data(dataPoints)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.lng, d.lat])[0] + 5;
            })
            .attr("cy", function (d) {
                return projection([d.lng, d.lat])[1] + 15;
            })
            .attr("r", (d) => {
                return (d.Population / 10500)
            })
        g.selectAll("text")
            .data(dataPoints)
            .enter()
            .append("text")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .transition()
            .duration(1000)
            .text(function (d) {
                return d.County;
            })
            .attr("x", function (d) { return projection([d.lng, d.lat])[0] + 5; })
            .attr("y", function (d) { return projection([d.lng, d.lat])[1] + 15; })
            .attr("class", "labels")
            
    }
}

function drawData(mapData, dataPoints) {
    // Checking If SVG alerady exists
    if (svg) {
        d3.select("svg.country").remove();
    }
    // Creating Map
    createSvg();
    // Adding Circles over Map
    drawCircles(mapData, dataPoints);
}
// On Page Load, Calling the LoadData function with 50 Points
window.onload = loadData(50);

