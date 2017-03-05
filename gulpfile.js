var gulp = require('gulp');
var	concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var clean = require('gulp-clean');
var autoprefixer = require('gulp-autoprefixer');
var rename = require ('gulp-rename');
var postcss = require('gulp-postcss');
var reporter = require('postcss-browser-reporter');
var stylelint = require('stylelint');
var stylelintGulp = require('gulp-stylelint');
var assets = require ('postcss-assets');
var short = require('postcss-short');
var handlebars = require('gulp-compile-handlebars');

var templateContext = require('./src/example.json');
var config = require('./.stylelintrc.json');

var browserSync = require('browser-sync').create();

gulp.task('default', ['dev']);
gulp.task('dev', ['build-dev', 'browser-sync', 'watch']);
gulp.task('prod', ['clean'], function() {
	gulp.run('build-dev');
});

gulp.task('build-dev', ['css-dev', 'assets', 'scripts', 'handlebars' ]);
gulp.task('build-prod', ['css-prod', 'assets', 'scripts', 'handlebars']);
	
gulp.task('css-dev', function () {
	var processors = [
		stylelint(config),
		assets ({
			loadPaths: ['src/assets/img/'],
			relativTo: 'src/styles/'
		}),		
		reporter({
			'selector': 'body:before'
		}),
		short
  ];
	return gulp.src('./src/styles/*.css')
		.pipe(concat('styles.css'))
		.pipe(postcss(processors))
		.pipe(rename('styleOut.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('./build/styles/'));
});

gulp.task('css-prod', function () {
		var processors = [
		short,
		assets ({
			loadPaths: ['src/assets/img/'],
			relativTo: 'src/styles/'
		}),
  ];
	return gulp.src('./src/styles/*.css')
		.pipe(concat('styles.css'))
		.pipe(cssnano())
		.pipe(rename('styleOut.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('./build/styles/'));
});

gulp.task('html', function () {
	return gulp.src('./src/index.html')
		.pipe(gulp.dest('./build/'));
});

gulp.task('browser-sync', function() {
	return browserSync.init({
		server: {
			baseDir: './build/'
		}
	});
});

gulp.task('watch', function() {
	gulp.watch('./src/styles/*.css', ['css-dev']);
	gulp.watch('./src/index.html', ['html']);
	gulp.watch('./src/scripts/*.js',['scripts']);
	gulp.watch('./src/partials/*.hbs',['handlebars']);
	gulp.watch('.src/example.json');
	gulp.watch('./src/**/*.*', browserSync.reload);
});

gulp.task('clean', function() {
	return gulp.src('build/')
		.pipe(clean());
});

gulp.task('assets', function() {
	return gulp.src('src/assets/**/*.*')
		.pipe(gulp.dest('./build/assets/'));
});

gulp.task('scripts', function () {
	return gulp.src('./src/scripts/*.js')
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('./build/scripts/'));
});

gulp.task('handlebars', function (){
		var options = {
			batch: ['./src/partials/']
		};
		return gulp.src('./src/index.hbs')
			.pipe(handlebars(templateContext, options))
			.pipe(rename('index.html'))
			.pipe(gulp.dest('./build/'));
});
