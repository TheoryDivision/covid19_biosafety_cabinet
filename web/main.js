// Inspired by http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774

$('.dropdown-item').on('click',  function(){
    var btnObj = $(this).parent().siblings('button');
    $(btnObj).text($(this).text());
    $(btnObj).val($(this).text());
});


var radius = 20;
var resolution = 100;

var dataset = [];
var frame_left = document.getElementById("room").getBoundingClientRect().left;
var frame_top = document.getElementById("room").getBoundingClientRect().top;
var screen_width = document.getElementById("room").getBoundingClientRect().width;
var screen_height = document.getElementById("room").getBoundingClientRect().height;
var room_width = 300; // cm
var room_depth = 300; // cm
var previous_width = room_width;
var previous_depth = room_depth;
var target_dose = 1; // Joules/cm^2

var x_scale = d3.scaleLinear().domain([0, room_width]).range([0, screen_width]);
var y_scale = d3.scaleLinear().domain([0, room_depth]).range([0, screen_height]);
var color_scale = d3.scaleSequential(d3.interpolateViridis).domain([0,720]);

var active_data;

svg = d3.select("#room");

var rect_tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { if (d.time) {return Math.ceil(d.time) + " minutes"; } else {return "Click to add a light source";}});

var circle_tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return "X: " + d.x + " Y: " + d.y + " Intensity: " + d.intensity; });

svg.call(rect_tool_tip);
svg.call(circle_tool_tip);
  
drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
        // .subject(function(d){
        //     // console.log("subject", d);
        //     return {x: x_scale.invert(d.x), y: y_scale.invert(d.y), intensity:d.intensity}
        // });


make_heatmap();

svg.on("click", function(){
    if (d3.event.defaultPrevented) return; // dragged

    var coords = d3.mouse(this);

    // Normally we go from data to pixels, but here we're doing pixels to data
    var newData= {
        x: Math.round( x_scale.invert(coords[0])),  // Takes the pixel number to convert to number
        y: Math.round( y_scale.invert(coords[1])),
        intensity: 260,  //uW/cm^2
        distance: 100 // cm
    };
    // console.log("coords", coords, "newdata", newData);
    addLamp(newData);
});


var legendSvg = d3.select('#legend-svg');
