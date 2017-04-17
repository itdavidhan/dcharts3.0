dcharts.prototype.complexBar = function(data, options) {

	var margin = options && options.margin ? options.margin : this.default.MARGIN;
	var width = options && options.width ? options.width : this.default.WIDTH;
	var height = options && options.height ? options.height : this.default.HEIGHT;
	var color = options && options.color ? options.color : this.default.COLOR;

	function _getDataKey(data) {

		var arr1 = [];
		var arr2 = [];
		var arr3 = [];

		data[0].dim.map(function(item) {
			arr1.push(item.key);
		});

		data[0].dim[0].children.map(function(item) {
			arr2.push(item.key);
		});
		data.map(function(item) {
			arr3.push(item.measure); 
		});

		// console.log(arr1, arr2, arr3);
		return {key0: arr1, key1: arr2, measure: arr3};
	}

	var x0 = d3.scale.ordinal()
	    .domain(_getDataKey(data).key0)
	    .rangeBands([0, width-margin.left-margin.right], .2);

	var x1 = d3.scale.ordinal()
	    .domain(_getDataKey(data).key1)
	    .rangeBands([0, x0.rangeBand()], .2);

	var y0 = d3.scale.ordinal()
	    .domain(_getDataKey(data).measure)
	    .rangeRoundBands([0, height-margin.top-margin.bottom], .15, 0);

	var y1 = d3.scale.linear()
	    .domain([0, 1])
	    .range([y0.rangeBand(), 0]);

	var z = d3.scale.category10();

	var xAxis0 = d3.svg.axis()
	    .scale(x0)
	    .orient("top");

	var xAxis1 = d3.svg.axis()
	    .scale(x1)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y1)
	    .orient("left")
	    .ticks(4, "%");

	this.ele.select("svg").remove();

	var svg = this.ele.append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
	    .attr("class", "axis axis--x")
	    .attr("transform", "translate(0," + 0 + ")")
	    .call(xAxis0);

	// svg.append("g").selectAll("g")
	//     .data(_getDataKey(data).key1)
	//     .enter().append("g")
	//     .attr("transform", function(d, i) {console.log(d); return "translate(" + x1(d) + "," + height + ")"; })
	//     .attr("class", "x axis")
	//     .call(xAxis1);


	var multiple = svg.selectAll(".multiple")
	    .data( data )
	  .enter().append("g")
	    .attr("class", function(d, i) {
	    	return "multiple multiple"+i;
	    })
	    .attr("transform", function(d) { return "translate(0," + y0(d.measure) + ")"; });

	multiple.append("g")
	    .attr("class", "axis axis--y axis--y-inside")
	    .call(yAxis);
	    // .call(yAxis.tickSize(-(width-margin.left-margin.right)));

	multiple.append("text")
	    .attr("class", "title")
	    .attr("transform", "translate(" + (width-margin.left-margin.right - 6) + "," + (y0.rangeBand() - 6) + ")")
	    .style("text-anchor", "end")
	    .text(function(d) { return d.measure.replace(/-/g, " "); });

	// svg.select(".axis--y-outside").append("text")
	//     .attr("x", 3)
	//     .attr("y", y1(y1.ticks(4).pop()))
	//     .attr("dy", ".35em")
	//     .attr("class", "title")
	//     .text("Probability");

	var _g = multiple.append("g").attr("class", "_g");
	var _m0 = svg.select(".multiple0");
	_m0.selectAll(".g2")
		.data(function(data) {
			return data.dim;
		})
		.enter().append("g")
		.attr("class", "g2")
		.attr("transform", function(d, i) { return "translate(" + x0(d.key) + ","+(height-margin.top-margin.bottom)+")"; })
		.append("g")
		.attr("class", "x axis")
		.call(xAxis1);

	_g.selectAll(".g1")
		.data(function(data) {
			return data.dim;
		})
		.enter().append("g")
		.attr("class", "g1")
		.attr("transform", function(d, i) { return "translate(" + x0(d.key) + ",0)"; })
		.selectAll("rect")
		  .data(function(d) { return d.children; })
		.enter().append("rect")
			.style("fill", function(d, i) { return color[i%(data[0].dim[0].children.length)]; })
		  .attr("width", x1.rangeBand())
		  .attr("height", function(d) {return y0.rangeBand() - y1(d.value);})
		  .attr("x", function(d, i) { return x1(d.key); })
		  .attr("y", function(d) { return y1(d.value); });

	svg.select(".multiple0").selectAll('.g2').selectAll('.tick text')
      .attr('transform', 'rotate(' + 45 + ' -10,20)');
};