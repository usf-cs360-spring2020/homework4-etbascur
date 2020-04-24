function drawChart(data){


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
    //   return d["Box"]
    // })
    .rollup(function(v) {
      return v.length;
    })
    .entries(data);

  //console.log("nested_data", nested_data);

  let h_data = d3.hierarchy(nested_data[0], function(d) {
    //console.log("values", d.values);
    return d.values;
  });
  root= nested_data[0];
//  console.log("root", root);

  h_data.count()
  h_data.sum(row => row.value)

    height = 500;
    width = 960;
    diameter = Math.min(width, height);
    pad = 14;
    h_data.sort(function(a, b) {
      return b.height - a.height || b.count - a.count;
    });

    let layout = d3.cluster().size([2 * Math.PI, (diameter / 2) - pad]);

    layout(h_data);

    h_data.each(function(node) {
      node.theta = node.x;
      node.radial = node.y;

      var point = toCartesian(node.radial, node.theta);
      node.x = point.x;
      node.y = point.y;
    });

    let svg = d3.select("body").select("svg#area")
        .style("width", width)
        .style("height", height);

    let plot = svg.append("g")
      .attr("id", "plot")
      .attr("transform", translate(width / 2, height / 2));

      //**EDGE GENERATOR**//
    let generator = d3.linkRadial()
      .angle(d => d.theta + Math.PI / 2) // rotate, 0 angle is mapped differently here
      .radius(d => d.radial);

    color = d3.scaleSequential([h_data.height, 0], d3.interpolatePlasma)

    drawLinks(plot.append("g"), h_data.links(), generator);
    drawNodes(plot.append("g"), h_data.descendants(), true);

    let legPlot = svg.append("g")
    .attr("id", "legendOrdinal")
    .attr("transform", translate(width - 150,height/8));

    legend(svg);
    console.log("descend",h_data.descendants());





}

function toCartesian(r, theta) {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta)
  };
}

function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
}

function drawLinks(g, links, generator) {
  let paths = g.selectAll('path')
    .data(links)
    .enter()
    .append('path')
    .attr('d', generator)
    .attr('class', 'link');
}

function drawNodes(g, nodes, raise) {
  let r = 5;
  let circles = g.selectAll('circle')
    .data(nodes, node => node.data.key)
    .enter()
    .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.key)
      .attr('class', 'node')
      .style('fill', d => color(d.depth));

  setupEvents(g, circles, raise);
}

function setupEvents(g, selection, raise) {


  // show tooltip text on mouseover (hover)
  selection.on('mouseover.tooltip', function(d) {
    showTooltip(g, d3.select(this));
    //console.log(d);
    selection.filter(e => (d.data.key !== e.data.key)).transition().style("opacity", 0.1);


  });

  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.select("#tooltip").remove();
    selection.transition().style("opacity", 1.0);
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

  let name = datum.data.key;

  // create tooltip
//   console.log("datum", datum);
  numberFormat = d3.format(".2~s");
  text = `${name} (${numberFormat(datum.value)} cases)`;

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

  function legend(svg){
    // Handmade legend
    svg.append("circle").attr("cx",830).attr("cy",130).attr("r", 6).style("fill","rgb(240, 249, 33)").style("stroke", "silver")
    svg.append("circle").attr("cx",830).attr("cy",160).attr("r", 6).style("fill", "rgb(204, 71, 120)").style("stroke", "silver")
    svg.append("circle").attr("cx",830).attr("cy",190).attr("r", 6).style("fill", "rgb(13, 8, 135)").style("stroke", "silver")
    svg.append("text").attr("x", 850).attr("y", 130).text("City").style("font-size", "15px").style("fill", "#75888a").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 850).attr("y", 160).text("Battalion").style("font-size", "15px").style("fill", "#75888a").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 850).attr("y", 190).text("Staion Number").style("font-size", "15px").style("fill", "#75888a").attr("alignment-baseline","middle")
  }
