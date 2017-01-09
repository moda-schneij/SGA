var gulp = require('gulp');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
var $ = require('gulp-load-plugins')();

gulp.task('copy-files', gulp.series(
  copyFiles
));

function copyFiles() {
  /* return gulp.src('./index.jsp')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./')); */
}

gulp.task('browser-sync', function() {
  browserSync.init({
    files: ['./**/*.{html,htm,css,js}'],
    host: '4mmhn32.pdx.odshp.com',
    server: {
      baseDir: './',
      middleware: [
        log({format: '%date %status %method %url'}),
        historyFallback({"index": '/index.html'})
      ]
    },
    browser: 'chrome',
    startPath: '/',
    open: 'external'
  });
});

gulp.task('dev:scripts', () => {
  return gulp
    .src('./app/**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest('./build/scripts'));
});