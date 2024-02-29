  var svg = d3.select("#timeline__container"),
      margin = {top: 0, right: 20, bottom: 10, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = 130 - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%b %Y");

  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x),
      yAxis = d3.axisLeft(y);

  var brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed)
      .on('end', ramdomizeMarkers);

  var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

  // var area = d3.area()
  //     .curve(d3.curveMonotoneX)
  //     .x(function(d) { return x(d.date); })
  //     .y0(height)
  //     .y1(function(d) { return y(d.price); });

  var area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.price); });

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  // var focus = svg.append("g")
  //     .attr("class", "focus")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/sp500.csv", type, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.price; })]);
    // x2.domain(x.domain());
    // y2.domain(y.domain());

    // focus.append("path")
    //     .datum(data)
    //     .attr("class", "area")
    //     .attr("d", area);

    // focus.append("g")
    //     .attr("class", "axis axis--x")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(xAxis);

    // focus.append("g")
    //     .attr("class", "axis axis--y")
    //     .call(yAxis);

    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    // svg.append("rect")
    //     .attr("class", "zoom")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //     .call(zoom);
  });

  function brushed() {
    console.log('brushed')
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x.range();
    x.domain(s.map(x.invert, x));
    // focus.select(".area").attr("d", area);
    // focus.select(".axis--x").call(xAxis);
    // console.log(x.invert(d3.brushSelection(this)[0]))
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x).domain());
    // focus.select(".area").attr("d", area);
    // focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  }

  function type(d) {
    d.date = parseDate(d.date);
    d.price = +d.price;
    return d;
  }

  function ramdomizeMarkers(){
    console.log('ramdomizeMarkers')
    // map.removeLayer(markers);
markers.clearLayers();
    // var markers = L.markerClusterGroup();

  for (let i=0; i<10; i++) {
    var popup = 'markers[i].name' +
                '<br/>' + 'markers[i].city' +
                '<br/><b>IATA/FAA:</b> ' + 'markers[i].iata_faa' +
                '<br/><b>ICAO:</b> ' + 'markers[i].icao' +
                '<br/><b>Altitude:</b> ' + 'Math.round( markers[i].alt * 0.3048 )' + ' m' +
                '<br/><b>Timezone:</b> ' + 'markers[i].tz';
    const marker = L.marker([
      getRandom(0, 100), 
      getRandom(-100, 100)
    ]).bindPopup( popup )
    markers.addLayer(marker)
  }
map.addLayer(markers);
  }