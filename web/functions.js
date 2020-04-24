function scale () {
    return d3.geoTransform({
        point: function(x, y) {
            var new_x, new_y;
            // if (x == 0) {
            //     new_x = -1;
            // } else {
                new_x = (x-1)*(screen_width)/(resolution);
            // }
            // if (y == 0) {
            //     new_y = -1;
            //     // new_x += 10;
            // } else {
                new_y = (y-1)*(screen_height)/(resolution);
            // }

            this.stream.point( new_x , new_y);
        }
    });
    }

function updateTarget() {
    target_dose = document.getElementById("target_input").value;
    // console.log(target_dose);
    updateHeatmap();
}

function updateSVGWidthAndHeight() {
    aspect_ratio = room_depth/room_width;
    screen_height = screen_width * aspect_ratio;
    svg.attr("height", screen_height);
    x_scale = d3.scaleLinear().domain([0, room_width]).range([0, screen_width]);
    y_scale = d3.scaleLinear().domain([0, room_depth]).range([0, screen_height]); 
}

function updateMaxTime() {
    max_time = +document.getElementById("time_input").value;
    color_scale = d3.scaleSequential(clipped_viridis).domain([max_time, 0]).unknown("black");
    updateHeatmap();
}

function updateWidth() {
    previous_width = room_width;
    room_width = +document.getElementById("width_input").value;
    // console.log(room_width);
    updateSVGWidthAndHeight();
    remove_heatmap();
    rescaleData();
    updateCircles();
    make_heatmap();
    updateHeatmap();
    svg.selectAll("circle").raise();
}

function updateDepth() {
    previous_depth = room_depth;
    room_depth = +document.getElementById("depth_input").value;
    updateSVGWidthAndHeight();
    // console.log(room_depth);
    remove_heatmap();
    rescaleData();
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
    svg.selectAll("path").remove();
    svg.selectAll("rect")
        .style("fill", function(d){d.time = calculateTimeToTarget(calculateIntensity(d)); return color_scale(d.time);})
        .style("stroke", function(d){return color_scale(d.time);});

    updateColorBar();

    var heatmap_data = [];
    for (y = -room_depth/resolution; y < room_depth+room_depth/resolution; y+=room_depth/resolution){
        for (x = -room_width/resolution; x < room_width+room_width/resolution; x+=room_width/resolution){    
            heatmap_data.push(calculateTimeToTarget(calculateIntensity([x,y])));
        }
    }

    var contours = d3.contours()
    // .size([room_width, room_depth])
    .size([resolution+2, resolution+2])
    .thresholds(d3.range(0, max_time, max_time/10))
    (heatmap_data);

    console.log(contours)

    svg.selectAll("path")
        .data(contours)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(scale()))
        .attr("fill", "none")
        .attr("stroke", "white");
}

function updateCircles() {
    svg.selectAll("circle").data([]).exit().remove();
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x_scale(d.x); })
        .attr("cy", function(d) { return y_scale(d.y); })
        .attr("r", radius)
        .style("fill", "violet")
        .call(drag)
        .on("click", removeElement)
        .on('mouseover', circle_tool_tip.show)
        .on('mouseout', circle_tool_tip.hide)
        .on("contextmenu", lampMenu);
}

function rescaleData() {
    for (data of dataset) {
        if (previous_width != -1) {
            data.x = room_width * data.x/previous_width;
        }
        if (previous_depth != -1) {
            data.y = room_depth * data.y/previous_depth;
        }
    }

    previous_width = -1;
    previous_depth = -1;
}

function dragstarted(d) {
    
    // console.log(d3.select(this).attr("cx"));
    d3.select(this).raise().attr("stroke", "black");
    // console.log(d3.event);
    // console.log(d3.select(this).attr("cx"));
}

function dragged(d) {
    // console.log(d);
    var coords = d3.mouse(this);
    d.x = Math.round(x_scale.invert(coords[0]));
    d.y = Math.round(y_scale.invert(coords[1]));
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
        .style("fill", function(d){d.time = calculateTimeToTarget(calculateIntensity(d)); return color_scale(d.time);})
        .style("stroke", function(d){return color_scale(d.time);})
        .on('mouseover', rect_tool_tip.show)
        .on('mouseout', rect_tool_tip.hide);

        updateColorBar();

}

function remove_heatmap() {
    svg.selectAll("rect")
        .data([])
        .exit()
        .remove();
}

function linspace(start, end, n) {
    var out = [];
    var delta = (end - start) / (n - 1);

    var i = 0;
    while(i < (n - 1)) {
        out.push(start + (i * delta));
        i++;
    }

    out.push(end);
    return out;
}

function updateColorBar() {
    legendSvg.selectAll(".bars").remove();
    legendSvg.selectAll("g").remove();

    legend_height = document.getElementById("legend-svg").getBoundingClientRect().height - 20;

    var bars = legendSvg.selectAll(".bars")
    .data(d3.range(0, max_time, max_time/legend_height), function(d) { return d; })
        .enter().append("rect")
            .attr("class", "bars")
            .attr("y", function(d, i) { return i + 10; })
            .attr("x", 0)
            .attr("height", 1)
            .attr("width", 40)
            .style("fill", function(d, i ) { return color_scale(d); })
            .style("stroke", function(d, i ) { return color_scale(d); })

    var color_axis_scale = d3.scaleLinear().domain(color_scale.domain()).range([legend_height, 0]);
    var color_axis = d3.axisRight(color_axis_scale);
    legendSvg.append("g")
            .attr("transform", "translate(45,10)")
             .call(color_axis);
}

function lampMenu(d){
    d3.event.preventDefault();
    // console.log("context", d);
    active_data = dataset[dataset.indexOf(d)];
    // console.log(active_data);
    document.getElementById("modal_lamp_x_input").value = d.x;
    document.getElementById("modal_lamp_y_input").value = d.y;
    document.getElementById("modal_intensity_input").value = d.intensity;
    document.getElementById("modal_intensity_distance_input").value = d.distance;    
    // $('#lampModalBody').text("Intensity: " + d.intensity + "<br>Distance of specified intensity: " + d.distance ); 
    $('#myModal').modal({show:true}); 
    return false;
}

function addLamp(newData) {
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
        .on("click", removeElement)
        .on('mouseover', circle_tool_tip.show)
        .on('mouseout', circle_tool_tip.hide)
        .on("contextmenu", lampMenu);

    updateHeatmap();

}

function updateLamp() {
    active_data.x = +document.getElementById("modal_lamp_x_input").value;
    active_data.y = +document.getElementById("modal_lamp_y_input").value;
    active_data.intensity = +document.getElementById("modal_intensity_input").value;
    active_data.distance = +document.getElementById("modal_intensity_distance_input").value;
    
    updateCircles();
    updateHeatmap();
}

function addLampFromForm(){

    var newData= {
        x: +document.getElementById("lamp_x_input").value,  // Takes the pixel number to convert to number
        y: +document.getElementById("lamp_y_input").value,
        intensity: +document.getElementById("intensity_input").value,  //uW/cm^2
        distance: +document.getElementById("intensity_distance_input").value // cm
    };
    // console.log("coords", coords, "newdata", newData);
    addLamp(newData);
}

function clearLamps() {
    dataset = [];
    updateCircles();
    updateHeatmap();
}