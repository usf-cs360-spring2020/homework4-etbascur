function drawPack(data){

  let nested_data = d3.nest()
  .key(function(d) {
    return d["City"];
  })
  .key(function(d) {
    return d["Zipcode of Incident"]
  })
  .key(function(d) {
    return d["Neighborhooods - Analysis Boundaries"]
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
  color = d3.scaleSequential([3, 0], d3.interpolateViridis);
  //console.log("root", root);


  // make sure value is set
  h_data.count();
  h_data.sum(d => d.value)

  h_data.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });


  let layout = d3.pack()
    .padding(r)
    .size([diameter - 2 * pad, diameter - 2 * pad]);

  layout(h_data);


  let svg = d3.select("body").select("svg#packed")
      .style("width", width)
      .style("height", height);

  // let plot = svg.append("g")
  //   .attr("id", "plot")
  //   .attr("transform", translate(pad, pad));
    let plot = svg.append("g")
      .attr("id", "plot")
      .attr("transform", translate(240, 10));

  drawNodes(plot.append("g"), h_data.descendants(), false);




function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
}

function drawNodes(g, nodes, raise) {
  //let r = 5;
  let circles = g.selectAll('circle')
      .data(nodes, node => node.data.key)
      .enter()
      .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.key)
      .attr('class', 'node')
      .style('fill', d => color(d.depth))

  setupEvents(g, circles, raise);
}

function setupEvents(g, selection, raise) {
  selection.on('mouseover.highlight', function(d) {
    // https://github.com/d3/d3-hierarchy#node_path
    // returns path from d3.select(this) node to selection.data()[0] root node
    let path = d3.select(this).datum().path(selection.data()[0]);

    // select all of the nodes on the shortest path
    let update = selection.data(path, node => node.data.key);

    // highlight the selected nodes
    update.classed('selected', true);

    if (raise) {
      update.raise();
    }
  });

  selection.on('mouseout.highlight', function(d) {
    let path = d3.select(this).datum().path(selection.data()[0]);
    let update = selection.data(path, node => node.data.key);
    update.classed('selected', false);
  });

  // show tooltip text on mouseover (hover)
  selection.on('mouseover.tooltip', function(d) {
    showTooltip(g, d3.select(this));
  });

  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.select("#tooltip").remove();
  });
}

function showTooltip(g, node) {
  let gbox = g.node().getBBox();     // get bounding box of group BEFORE adding text
  let nbox = node.node().getBBox();  // get bounding box of node

  // calculate shift amount
  let dx = nbox.width / 2;
  let dy = nbox.height / 2;

  // retrieve node attributes (calculate middle point)
  let x = nbox.x + dx;
  let y = nbox.y + dy;

  // get data for node
  let datum = node.datum();

  // remove "java.base." from the node name
  let name = datum.data.key;

  // use node name and total size as tooltip text
  numberFormat = d3.format(".2~s");
  text = `${name} (${numberFormat(datum.value)} cases)`;

  // create tooltip
  let tooltip = g.append('text')
    .text(text)
    .attr('x', x)
    .attr('y', y)
    .attr('dy', -dy - 4) // shift upward above circle
    .attr('text-anchor', 'middle') // anchor in the middle
    .attr('id', 'tooltip');

  // it is possible the tooltip will fall off the edge of the
  // plot area. we can detect when this happens, and set the
  // text anchor appropriately

  // get bounding box for the text
  let tbox = tooltip.node().getBBox();

  // if text will fall off left side, anchor at start
  if (tbox.x < gbox.x) {
    tooltip.attr('text-anchor', 'start');
    tooltip.attr('dx', -dx); // nudge text over from center
  }
  // if text will fall off right side, anchor at end
  else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
    tooltip.attr('text-anchor', 'end');
    tooltip.attr('dx', dx);
  }

  // if text will fall off top side, place below circle instead
  if (tbox.y < gbox.y) {
    tooltip.attr('dy', dy + tbox.height);
  }
}
}
