var w = 1300;
var h = window.screen.height;
var svg;
var circleLabels;

var towns = document.querySelector(".range").value;

const allRanges = document.querySelectorAll(".range-wrap");
allRanges.forEach(wrap => {
    const range = wrap.querySelector(".range");
    const bubble = wrap.querySelector(".bubble");

    range.addEventListener("input", () => {
        setBubble(range, bubble);
    });
    setBubble(range, bubble);
});

function setBubble(range, bubble) {
    const val = range.value;
    const min = range.min;
    const max = range.max;
    const newVal = Number(((val - min) * 100) / (max - min));
    bubble.innerHTML = val;

    bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
}

// Creating Projection of Map with customizations
var projection = d3.geoAlbers().center([1.5, 55.2]).rotate([4.4, 0]).parallels([50, 50]).scale(5000).translate([w / 2, h / 2]);
var path = d3.geoPath().projection(projection);

// load data on Page Load
function loadData(towns) {
    var countryData = d3.json("./ukcounties.geojson");
    console.log(towns);
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

// Creating SVG of Map
function createSvg() {
    svg = d3.select("div#content").append("svg").style("background-color", "#c9e8fd")
        .attr("viewBox", "0 0 " + w + " " + h)
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
    svg.selectAll("path")
        .data(mapData.features)
        .enter().append("path")
        .attr("class", "continent")
        .attr("d", path)
        .append("title")
        .text((d) => d.properties.name)

    // Points on map
    if (document.contains(document.getElementById("tooltip1"))) {
        document.getElementById("tooltip1").remove();
    }
    var Tooltip = d3.select("div#main-content .info")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip1")
        .style("opacity", 1)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Showing Region Details of Hover
    const mouseover = function (event, d) {
        Tooltip.style("opacity", 1)
    }
    var mousemove = function (event, d) {
        Tooltip
            .html(d.County + "<br>" + "Population: " + d.Population +"<br>" + "Longitude: " + d.lng + "<br>" + "Latitude: " + d.lat)
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 - 30 + "px")
    }
    var mouseleave = function (event, d) {
        Tooltip.style("opacity", 0)
    }
    let g = svg.append("g");

    g.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(3000)
        .attr("cx", function (d) {
            this.circleLabels = d;
            console.log(this.circleLabels);
            return projection([d.lng, d.lat])[0] + 5;
        })
        .attr("cy", function (d) {
            return projection([d.lng, d.lat])[1] + 15;
        })
        .attr("r", (d) => {
            return (d.Population / 10500)
        })
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

