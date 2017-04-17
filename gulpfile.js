var gulp = require('gulp');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');

// js格式检查
gulp.task('jscs', function() {
    gulp.src('./src/*.js')
    .pipe(jscs({fix: true}))
    .pipe(jscs.reporter());
});

// 合并dcharts.js: gulp dcct
gulp.task('dcct', function() {
    var path = './src/';
    gulp.src([
        path + 'start.js', // NOTE: keep this first
        path + 'core.js',
        // path + 'handle.js',
        // path + 'utils.js',
        // path + 'filter.js',
        // path + 'bar-chart.js',
        // path + 'cross-bar-chart.js',
        // path + 'line-chart.js',
        // path + 'area-chart.js',
        // path + 'pie-chart.js',
        // path + 'stack-chart.js',
        // path + 'bubble-chart.js',
        // path + 'index-card.js',
        // path + 'funnel-chart.js',
        // path + 'legend.js',
        // path + 'callback.js',
        // path + 'tooltip.js',
        // path + 'flicker.js',
        path + 'end.js' // NOTE: keep this last
    ])
    .pipe(concat('dcharts.js'))
    .pipe(gulp.dest('./lib'));
});

// dcharts.js 压缩
gulp.task('uglify', function() {
    gulp.src('./lib/dcharts.js')
    .pipe(uglify())
    .pipe(gulp.dest('./lib/min'));
});

// 监控
gulp.task('watch', function() {
    gulp.watch('./src/*.js', ['dcct']);
});

gulp.task('default', ['dcct', 'watch']);