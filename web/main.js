// Inspired by http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774

var radius = 20;
var resolution = 100;

var dataset = [];
var frame_left = document.getElementById("room").getBoundingClientRect().left;
var frame_top = document.getElementById("room").getBoundingClientRect().top;
var screen_width = document.getElementById("room").getBoundingClientRect().width;
var screen_height = document.getElementById("room").getBoundingClientRect().height;
var room_width = 100;
var room_height = 200;
var deltaX, deltaY;

x_scale = d3.scaleLinear().domain([0, room_width]).range([0, screen_width]);
y_scale = d3.scaleLinear().domain([0, room_height]).range([0, screen_height]);
color_scale = d3.scaleSequential(d3.interpolateViridis).domain([0,1]);

svg = d3.select("#room");

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

function calculateIntensity(d) {
    var intensity = 0;
    for (lamp of dataset) {
        dist = distance([lamp.x, lamp.y], d);
        // console.log(dist);
        intensity += lamp.fluence / Math.pow(dist,2);
    }
    // console.log(intensity);
    return intensity;
}

function removeElement(d) {
    if (d3.event.defaultPrevented) return; // dragged
    d3.event.stopPropagation();
    // need to remove this object from data
    var i = dataset.indexOf(d);
    dataset.splice(i, 1);
    // console.log(dataset, i);
    circles = svg.selectAll("circle")
        .data(dataset)
        .exit()
        .remove();
    updateHeatmap();
}

function updateHeatmap() {
    svg.selectAll("rect")
    .style("fill", function(d){return color_scale(calculateIntensity(d))})
    .style("stroke", function(d){return color_scale(calculateIntensity(d))});
}

function dragstarted(d) {
    
    // console.log(d3.select(this).attr("cx"));
    d3.select(this).raise().attr("stroke", "black");
    // console.log(d3.event);
    // console.log(d3.select(this).attr("cx"));
}

function dragged(d) {
    console.log(d);
    var coords = d3.mouse(this);
    d.x = x_scale.invert(coords[0]);
    d.y = y_scale.invert(coords[1]);
    console.log(d);
    d3.select(this).attr("cx", x_scale(d.x)).attr("cy", y_scale(d.y));
    // console.log(d3.select(this).attr("cx"));
    updateHeatmap();
}

function dragended(d) {
    d3.select(this).attr("stroke", null);
    updateHeatmap();
}
  
 drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
        // .subject(function(d){
        //     // console.log("subject", d);
        //     return {x: x_scale.invert(d.x), y: y_scale.invert(d.y), fluence:d.fluence}
        // });

var heatmap_data = [];
for (x = 0; x < room_width; x+=room_width/resolution){
    for (y = 0; y < room_height; y+=room_height/resolution){
        heatmap_data.push([x,y]);
    }
}

svg.selectAll("rect")
    .data(heatmap_data)
    .enter()
    .append("rect")
    .attr("x", function(d){return x_scale(d[0]);})
    .attr("y", function(d){return y_scale(d[1]);})
    .attr("width", screen_width/resolution)
    .attr("height", screen_height/resolution)
    .style("fill", "white")

svg.on("click", function(){
    if (d3.event.defaultPrevented) return; // dragged

    var coords = d3.mouse(this);

    // Normally we go from data to pixels, but here we're doing pixels to data
    var newData= {
        x: Math.round( x_scale.invert(coords[0])),  // Takes the pixel number to convert to number
        y: Math.round( y_scale.invert(coords[1])),
        fluence: 100
    };
    console.log("coords", coords, "newdata", newData);
    dataset.push(newData);   // Push data to our array
    // console.log(dataset);
    svg.selectAll("circle")  // For new circle, go through the update process
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x_scale(d.x); })
        .attr("cy", function(d) { return y_scale(d.y); })
        .attr("r", radius)
        .style("fill", "violet")
        .call(drag)
        .on("click", removeElement);

    updateHeatmap();

});


