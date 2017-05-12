dcharts.prototype.oneDimBar = function(data, options) {
	var margin = options && options.margin ? options.margin : this.default.MARGIN;
	var width = options && options.width ? options.width : this.default.WIDTH;
	var height = options && options.height ? options.height : this.default.HEIGHT;
	var color = options && options.color ? options.color : this.default.COLOR;
	var ele = this.ele;

	oneDim(data);

	function oneDim(data) {
		function _getDataKey(data) {
			var arr1 = [];
			var arr2 = [];
			for(var i in data[0]) {
				if(i !== 'name')  arr1.push(i);
			}
			data.map(function(item) {
				arr2.push(item.name); 
			});
			return {key: arr1, name: arr2};
		}

		function _getDataVal(data) {
			var max = -10000;
			var min = 10000;
			$.each(data, function(index, item) {
				for(var i in item) {
					if('name' != i && max < item[i]) max = item[i]; 
					if('name' != i && min > item[i]) min = item[i]; 
				}
			});
			return {max: max, min: min};
		}
		
		var x = d3.scale.ordinal()
		    // .domain(d3.range(9))
		    .domain(_getDataKey(data).key)
		    .rangeRoundBands([0, width-margin.left-margin.right], .5);

		var y0 = d3.scale.ordinal()
		    .domain(_getDataKey(data).name)
		    .rangeRoundBands([0, height-margin.top-margin.bottom], .15, 0);
		 
		var y1 = d3.scale.linear()
		    .domain([0, _getDataVal(data).max])
		    .range([y0.rangeBand(), 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y1)
		    .orient("left")
		    .ticks(4);
		    // .ticks(4, "%");

		ele.select('.dcharts-container').remove();

		var chartCont = ele.append('div').attr('class', 'dcharts-container');
		var svg = chartCont.append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
		    .attr("class", "axis axis--x")
		    .attr("transform", "translate(0," + (height-margin.top-margin.bottom) + ")")
		    .call(xAxis);

		var multiple = svg.selectAll(".multiple")
		    .data(y0.domain().map(function(d) { return {name: d}; }))
		  .enter().append("g")
		    .attr("class", "multiple")
		    .attr("transform", function(d) { return "translate(0," + y0(d.name) + ")"; });

		multiple.append("g")
		    .attr("class", "axis axis--y axis--y-inside")
		    .call(yAxis.tickSize(-(width-margin.left-margin.right)));

		// multiple.append("g")
		//     .attr("class", "axis axis--y axis--y-outside")
		//     .call(yAxis.tickSize(6));

		multiple.append("text")
		    .attr("class", "title")
		    .attr("transform", "translate(" + (width-margin.left-margin.right - 6) + "," + (y0.rangeBand() - 6) + ")")
		    .style("text-anchor", "end")
		    .text(function(d) { return d.name.replace(/-/g, " "); });

		svg.select(".axis--y-outside").append("text")
		    .attr("x", 3)
		    .attr("y", y1(y1.ticks(4).pop()))
		    .attr("dy", ".35em")
		    .attr("class", "title")
		    .text("Probability");

		multiple
		    .data(data, function(d) { return d.name; })
		    .selectAll("rect")
		    .data(function(d) { return x.domain().map(function(i) { return {key: i, value: +d[i]}; }); })
		    .enter().insert("rect", "*")
		    .attr("width", x.rangeBand())
		    .attr("x", function(d) { return x(d.key); })
		    .attr("y", function(d) { return y1(d.value); })
		    .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });
	}
};