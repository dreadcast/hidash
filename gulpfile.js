var gulp = require('gulp'),
	Y = require('yuidocjs'),
	fs = require('fs'),
	uglify = require('gulp-uglify'),
	git = require('gulp-git'),
	jeditor = require('gulp-json-editor'),
	bump = require('gulp-bump'),
	_ = require('./src/hidash.js');

gulp.task('scripts', function(cb){
	return gulp.src('src/hidash.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

// Version
var files = ['./package.json', './bower.json', './yuidoc.json'],
	version;
gulp.task('setVersion', function(){
	version = process.argv[4];
	
	gulp.src(files)
		.pipe(jeditor({
			version: version
		}))
		.pipe(gulp.dest('.'));
});

gulp.task('commitVersion', ['setVersion'], function(){
	gulp.src(files)
		.pipe(git.add())
		.pipe(git.commit('Changed version to ' + version));
});

gulp.task('version', ['commitVersion'], function(){
	git.tag(version, 'Changed version to ' + version);
});
/*
gulp.task('version', function(){
	version = process.argv[4];
	
	gulp.src('./**.json')
		.pipe(jeditor({
			version: version
		}))
		.pipe(gulp.dest('.'))
		.pipe(git.add())
		.pipe(git.commit('Changed version to ' + version))
		.pipe(git.tag(version, 'Changed version to ' + version))
});
*/
/*
var bumpType;

gulp.task('bump', function () {
	bumpType = process.argv[4];
	
	return gulp.src(['./package.json', './bower.json', './yuidoc.json'])
		.pipe(bump({
			type: bumpType
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump'], function () {
	var pkg = require('./package.json'),
		v = 'v' + pkg.version,
		message = 'Release ' + v;
	
	return gulp.src('./')
		.pipe(git.commit(message))
		.pipe(git.tag(v, message))
		.pipe(git.push('origin', 'with-gulp', '--tags'))
		.pipe(gulp.dest('./'));
});
*/




gulp.task('doc', function(cb){
	fs.readFile('yuidoc.json', function(err, data){
		var doc = JSON.parse(data),
			options = doc.options,
			json = (new Y.YUIDoc(options)).run(),
			builder = new Y.DocBuilder(options, json);
		builder.compile(cb);
	});
});



gulp.task('watch', function() {
  gulp.watch('src/hidash.js', ['scripts', 'doc']);
});

//gulp.task('default', ['watch', 'scripts', 'doc']);
