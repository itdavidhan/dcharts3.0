(function(window, d3, $) {

	function dcharts(cls) {
		this.cls = cls;
		this.ele = d3.select(this.cls);
		this.$ele = $(this.cls);
		this.default = {};
		this.default.WIDTH = this.$ele.width();
		this.default.HEIGHT = this.$ele.height();
		this.default.MARGIN = {top: 60, right: 30, bottom: 60, left: 30};
		this.default.COLOR = ['#5282e4', '#b5c334', '#fdcf10', '#e97c24', '#c1222a', '#ff8562', '#9bcb62', '#fbd960', '#f3a53a'];
	}
dcharts.prototype = {
	constructor: dcharts
};






// radar chart
dcharts.prototype.radar = function(data, ops) {
	var cfg = {
	 w: this.default.WIDTH - this.default.MARGIN.left - this.default.MARGIN.right,                //Width of the circle
	 h: this.default.HEIGHT - this.default.MARGIN.top - this.default.MARGIN.bottom,                //Height of the circle
	 margin: this.default.MARGIN, //The margins of the SVG
	 levels: 3,                //How many levels or inner circles should there be drawn
	 maxValue: 0,             //What is the value that the biggest circle will represent
	 labelFactor: 1.25,     //How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60,         //The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35,     //The opacity of the area of the blob
	 dotRadius: 4,             //The size of the colored circles of each blog
	 opacityCircles: 0.1,     //The opacity of the circles of each blob
	 strokeWidth: 2,         //The width of the stroke around each blob
	 roundStrokes: false,    //If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10()    //Color function
	};
	
	//Put all of the ops into a variable called cfg
	if('undefined' !== typeof ops){
	  for(var i in ops){
	    if('undefined' !== typeof ops[i]){ cfg[i] = ops[i]; }
	  }//for i
	}//if
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
	    
	var allAxis = (data[0].map(function(i, j){return i.axis})),    //Names of each axis
	    total = allAxis.length,                    //The number of different axes
	    radius = Math.min(cfg.w/2, cfg.h/2),     //Radius of the outermost circle
	    Format = d3.format('%'),                 //Percentage formatting
	    angleSlice = Math.PI * 2 / total;        //The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scale.linear()
	    .range([0, radius])
	    .domain([0, maxValue]);
	    
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	this.ele.select('.dcharts-container').remove();
	var chartCont = this.ele.append('div').attr('class', 'dcharts-container');
	//Initiate the radar chart SVG
	var svg = chartCont.append("svg")
	        .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
	        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
	        .attr("class", "radar");
	//Append a g element        
	var g = svg.append("g")
	        .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
	    feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
	    feMerge = filter.append('feMerge'),
	    feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
	    feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
	    .append("circle")
	    .attr("class", "gridCircle")
	    .attr("r", function(d, i){return radius/cfg.levels*d;})
	    .style("fill", "#CDCDCD")
	    .style("stroke", "#CDCDCD")
	    .style("fill-opacity", cfg.opacityCircles)
	    .style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
	    .data(allAxis)
	    .enter()
	    .append("g")
	    .attr("class", "axis");
	//Append the lines
	axis.append("line")
	    .attr("x1", 0)
	    .attr("y1", 0)
	    .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
	    .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
	    .attr("class", "line")
	    .style("stroke", "white")
	    .style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
	    .attr("class", "legend")
	    .style("font-size", "11px")
	    .attr("text-anchor", "middle")
	    .attr("dy", "0.35em")
	    .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
	    .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
	    .text(function(d){return d})
	    .call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.svg.line.radial()
	    .interpolate("linear-closed")
	    .radius(function(d) { return rScale(d.value); })
	    .angle(function(d,i) {    return i*angleSlice; });
	    
	if(cfg.roundStrokes) {
	    radarLine.interpolate("cardinal-closed");
	}
	            
	//Create a wrapper for the blobs    
	var blobWrapper = g.selectAll(".radarWrapper")
	    .data(data)
	    .enter().append("g")
	    .attr("class", "radarWrapper");
	        
	//Append the backgrounds    
	blobWrapper
	    .append("path")
	    .attr("class", "radarArea")
	    .attr("d", function(d,i) { return radarLine(d); })
	    .style("fill", function(d,i) { return cfg.color(i); })
	    .style("fill-opacity", cfg.opacityArea)
	    .on('mouseover', function (d,i){
	        //Dim all blobs
	        svg.selectAll(".radarArea")
	            .transition().duration(200)
	            .style("fill-opacity", 0.1); 
	        //Bring back the hovered over blob
	        d3.select(this)
	            .transition().duration(200)
	            .style("fill-opacity", 0.7);    
	    })
	    .on('mouseout', function(){
	        //Bring back all blobs
	        svg.selectAll(".radarArea")
	            .transition().duration(200)
	            .style("fill-opacity", cfg.opacityArea);
	    });
	    
	//Create the outlines    
	blobWrapper.append("path")
	    .attr("class", "radarStroke")
	    .attr("d", function(d,i) { return radarLine(d); })
	    .style("stroke-width", cfg.strokeWidth + "px")
	    .style("stroke", function(d,i) { return cfg.color(i); })
	    .style("fill", "none")
	    .style("filter" , "url(#glow)");        
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
	    .data(function(d,i) { return d; })
	    .enter().append("circle")
	    .attr("class", "radarCircle")
	    .attr("r", cfg.dotRadius)
	    .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
	    .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
	    .style("fill", function(d,i,j) { return cfg.color(j); })
	    .style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
	    .data(data)
	    .enter().append("g")
	    .attr("class", "radarCircleWrapper");
	    
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
	    .data(function(d,i) { return d; })
	    .enter().append("circle")
	    .attr("class", "radarInvisibleCircle")
	    .attr("r", cfg.dotRadius*1.5)
	    .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
	    .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
	    .style("fill", "none")
	    .style("pointer-events", "all")
	    .on("mouseover", function(d,i) {
	        newX =  parseFloat(d3.select(this).attr('cx')) - 10;
	        newY =  parseFloat(d3.select(this).attr('cy')) - 10;
	                
	        tooltip
	            .attr('x', newX)
	            .attr('y', newY)
	            .text(Format(d.value))
	            .transition().duration(200)
	            .style('opacity', 1);
	    })
	    .on("mouseout", function(){
	        tooltip.transition().duration(200)
	            .style("opacity", 0);
	    });
	    
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
	    .attr("class", "tooltip")
	    .style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text    
	function wrap(text, width) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.4, // ems
	        y = text.attr("y"),
	        x = text.attr("x"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
	        
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
	}//wrap    
};
dcharts.prototype.utils = {
	windowResize: function() {
		$(window).on('resize', function() {
			 
		});
	}
};
// funnel chart
dcharts.prototype.funnel = function(data, ops) {

  var DEFAULT_HEIGHT = this.default.HEIGHT,
      DEFAULT_WIDTH = this.default.WIDTH,
      DEFAULT_MARGIN = this.default.MARGIN,
      DEFAULT_COLOR = this.default.COLOR,
      DEFAULT_BOTTOM_PERCENT = 1/3;

  var cls = this.cls;

  FunnelChart = function(data, options) {
    
    this.data = data;
    this.totalEngagement = 0;
    options = options || {};
    for(var i = 0; i < this.data.length; i++){
      this.totalEngagement += this.data[i][1];
    }
    this.width = typeof options.width !== 'undefined' ? options.width : DEFAULT_WIDTH;
    this.height = typeof options.height !== 'undefined' ? options.height : DEFAULT_HEIGHT;
    this.margin = options.margin || DEFAULT_MARGIN;
    this.f_w = this.width - this.margin.left - this.margin.right;
    this.f_h = this.height - this.margin.top - this.margin.bottom;
    var bottomPct = typeof options.bottomPct !== 'undefined' ? options.bottomPct : DEFAULT_BOTTOM_PERCENT;
    this._slope = 2*this.f_h/(this.f_w - bottomPct*this.f_w);
    this._totalArea = (this.f_w+bottomPct*this.f_w)*this.f_h/2;
  };

  FunnelChart.prototype._getLabel = function(ind){
    /* Get label of a category at index 'ind' in this.data */
    return this.data[ind][0];
  };

  FunnelChart.prototype._getEngagementCount = function(ind){
    /* Get engagement value of a category at index 'ind' in this.data */
    return this.data[ind][1];
  };

  FunnelChart.prototype._createPaths = function(){
    /* Returns an array of points that can be passed into d3.svg.line to create a path for the funnel */
    trapezoids = [];

    function findNextPoints(chart, prevLeftX, prevRightX, prevHeight, dataInd){
      // reached end of funnel
      if(dataInd >= chart.data.length) return;

      // math to calculate coordinates of the next base
      area = chart.data[dataInd][1]*chart._totalArea/chart.totalEngagement;
      prevBaseLength = prevRightX - prevLeftX;
      nextBaseLength = Math.sqrt((chart._slope * prevBaseLength * prevBaseLength - 4 * area)/chart._slope);
      nextLeftX = (prevBaseLength - nextBaseLength)/2 + prevLeftX;
      nextRightX = prevRightX - (prevBaseLength-nextBaseLength)/2;
      nextHeight = chart._slope * (prevBaseLength-nextBaseLength)/2 + prevHeight;

      points = [[nextRightX, nextHeight]];
      points.push([prevRightX, prevHeight]);
      points.push([prevLeftX, prevHeight]);
      points.push([nextLeftX, nextHeight]);
      points.push([nextRightX, nextHeight]);
      trapezoids.push(points);

      findNextPoints(chart, nextLeftX, nextRightX, nextHeight, dataInd+1);
    }
    findNextPoints(this, 0, this.f_w, 0, 0);
    return trapezoids;
  };

  FunnelChart.prototype.draw = function(elem, speed){
    var DEFAULT_SPEED = 2.5;
    speed = typeof speed !== 'undefined' ? speed : DEFAULT_SPEED;

    var funnelSvg = d3.select(elem).html('')
              .append('div')
              .attr('class', 'dcharts-container')
              .append('svg:svg')
              .attr('width', this.width)
              .attr('height', this.height);

    var bodyG = funnelSvg.append('svg:g')
              .attr('class', 'body-g')
              .attr('transform', 'translate('+this.margin.left+','+this.margin.top+')');

    // Creates the correct d3 line for the funnel
    var funnelPath = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; });

    var paths = this._createPaths();

    function drawTrapezoids(funnel, i){
      var trapezoid = bodyG
                      .append('svg:path')
                      .attr('d', function(d){
                        return funnelPath(
                            [paths[i][0], paths[i][1], paths[i][2],
                            paths[i][2], paths[i][1], paths[i][2]]);
                      })
                      .attr('fill', '#fff');

      // trapezoid.on('click', function(i) {
      //     alert(i);
      // });

      nextHeight = paths[i][[paths[i].length]-1];

      var totalLength = trapezoid.node().getTotalLength();

      var transition = trapezoid
                      .transition()
                        .duration(totalLength/speed)
                        .ease("linear")
                        .attr("d", function(d){return funnelPath(paths[i]);})
                        .attr("fill", function(d){return DEFAULT_COLOR[i%totalLength];});

      bodyG
      .append('svg:text')
      .text(funnel._getLabel(i) + ': ' + funnel._getEngagementCount(i))
      .attr("x", function(d){ return funnel.f_w/2; })
      .attr("y", function(d){
        return (paths[i][0][1] + paths[i][1][1])/2;}) // Average height of bases
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff");

      if(i < paths.length - 1){
        transition.each('end', function(){
          drawTrapezoids(funnel, i+1);
        });
      }
    }

    drawTrapezoids(this, 0);
  };

  darwFunnel(this.cls);
 
  function darwFunnel(cls) {
    var chart = new FunnelChart(data, ops);
    chart.draw(cls);
  }
};

dcharts.prototype.multiDimBar = function(data, options) {

	var margin = options && options.margin ? options.margin : this.default.MARGIN;
	var width = options && options.width ? options.width : this.default.WIDTH;
	var height = options && options.height ? options.height : this.default.HEIGHT;
	var color = options && options.color ? options.color : this.default.COLOR;
	var ele = this.ele;

	multiDim(data);

	function multiDim(data) {
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

		_getDataVal(data);

		function _getDataVal(data) {

			var max = -10000;
			var min = 10000;

			$.each(data, function(index, item) {
				$.each(item.dim, function(i, d) {
					$.each(d.children, function(_i, _d) {
						if(max < _d.value) max = _d.value;
						if(min > _d.value) min = _d.value;
					});
				});
			});
			return {max: max, min: min};
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
		    .domain([0, _getDataVal(data).max])
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

		ele.select('.dcharts-container').remove();

		var chartCont = ele.append('div').attr('class', 'dcharts-container');
		var svg = chartCont.append("svg")
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
		    // .call(yAxis);
		    .call(yAxis.tickSize(-(width-margin.left-margin.right)));

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
				.style("fill", function(d, i) { return color[i%color.length]; })
			  .attr("width", x1.rangeBand())
			  .attr("height", function(d) {return y0.rangeBand() - y1(d.value);})
			  .attr("x", function(d, i) { return x1(d.key); })
			  .attr("y", function(d) { return y1(d.value); });

		svg.select(".multiple0").selectAll('.g2').selectAll('.tick text')
	      .attr('transform', 'rotate(' + 45 + ' -10,20)');
	}
};
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
 
	if(typeof window === 'object' && typeof window.document === 'object')
	{
	  window.dcharts = dcharts;
	}

})(window, d3, jQuery, undefined);