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