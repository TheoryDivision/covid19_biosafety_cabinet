function updateTarget() {
    target_dose = document.getElementById("target_input").value;
    // console.log(target_dose);
    updateHeatmap();
}

function updateWidth() {
    previous_width = room_width;
    room_width = +document.getElementById("width_input").value;
    // console.log(room_width);
    x_scale = d3.scaleLinear().domain([0, room_width]).range([0, screen_width]);
    y_scale = d3.scaleLinear().domain([0, room_depth]).range([0, screen_height]);    
    remove_heatmap();
    updateCircles();
    make_heatmap();
    updateHeatmap();
    svg.selectAll("circle").raise();
}

function updateDepth() {
    previous_depth = room_depth;
    room_depth = +document.getElementById("depth_input").value;
    // console.log(room_depth);
    x_scale = d3.scaleLinear().domain([0, room_width]).range([0, screen_width]);
    y_scale = d3.scaleLinear().domain([0, room_depth]).range([0, screen_height]);    
    remove_heatmap();
    updateCircles();
    make_heatmap();
    updateHeatmap();
    svg.selectAll("circle").raise();
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

function calculateIntensity(d) {
    var intensity = 0;
    for (lamp of dataset) {
        dist = distance([lamp.x, lamp.y], d);
        // console.log(dist);
        intensity += lamp.intensity * Math.pow(lamp.distance,2) / Math.pow(dist,2);
    }
    // console.log(intensity);
    return intensity;
}

function calculateTimeToTarget(intensity) {
    return (target_dose/(intensity/1000000)/60);
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
    circle_tool_tip.hide();
    updateHeatmap();
}

function updateHeatmap() {
    svg.selectAll("rect")
        .style("fill", function(d){d.time = calculateTimeToTarget(calculateIntensity(d)); return color_scale(d.time);})
        .style("stroke", function(d){return color_scale(d.time);});
}

function updateCircles() {
    rescaleData();
    svg.selectAll("circle").data([]).exit().remove();
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { console.log("update"); return x_scale(d.x); })
        .attr("cy", function(d) { return y_scale(d.y); })
        .attr("r", radius)
        .style("fill", "violet")
        .call(drag)
        .on("click", removeElement)
        .on('mouseover', circle_tool_tip.show)
        .on('mouseout', circle_tool_tip.hide);
}

function rescaleData() {
    for (data of dataset) {
        data.x = room_width * data.x/previous_width;
        data.y = room_depth * data.y/previous_depth;
    }
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
    // console.log(d);
    d3.select(this).attr("cx", x_scale(d.x)).attr("cy", y_scale(d.y));
    // console.log(d3.select(this).attr("cx"));
    updateHeatmap();
}

function dragended(d) {
    d3.select(this).attr("stroke", null);
    updateHeatmap();
}

function make_heatmap() {
    var heatmap_data = [];
    for (x = 0; x < room_width; x+=room_width/resolution){
        for (y = 0; y < room_depth; y+=room_depth/resolution){
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
        .on('mouseover', rect_tool_tip.show)
        .on('mouseout', rect_tool_tip.hide);

}

function remove_heatmap() {
    svg.selectAll("rect")
        .data([])
        .exit()
        .remove();
}