function treemap(data) {
  let nested_data = d3.nest()
  .key(function(d) {
    return d["City"];
  })
  .key(function(d) {
    return d["Battalion"]
  })
  .key(function(d) {
    return d["Station Area"]
  })
  // .key(function(d) {
  //   return d["Call Type Group"]
  // })
  .rollup(function(v) {
    return v.length;
  })
  .entries(data);

  console.log("nested_data", nested_data);

  let h_data = d3.hierarchy(nested_data[0], function(d) {
    //console.log("values", d.values);
    return d.values;
  });
  root = nested_data[0];

  height = 500;
  width = 960;
  diameter = Math.min(width, height);
  pad =14;
  r = 5;
  color = d3.scaleSequential([3, 0], d3.interpolatePlasma);


  // sort largest nodes first
  h_data.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });

  // make sure value is set
  h_data.sum(d => d.value);

  // layout based on width, height minus some padding
  let layout = d3.treemap().padding(r).size([width - 2 * pad, height - 2 * pad]);

  layout(h_data);

  let svg = d3.select("body").select("svg#tree")
      .style("width", width)
      .style("height", height+10);

  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad, pad));

  let rects = plot.selectAll("rect")
    .data(h_data.descendants())
    .enter()
    .append("rect")
    .attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("id", function(d) { return d.data.name; })
    .attr("class", "node")
    .style("fill", function(d) {return color(d.depth)});

  setupEvents(plot, rects, false);

}
