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
