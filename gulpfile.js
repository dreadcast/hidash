var gulp = require('gulp'),
	Y = require('yuidocjs'),
	fs = require('fs'),
	uglify = require('gulp-uglify'),
	git = require('gulp-git'),
	bump = require('gulp-bump');

var jsonFiles = ['./package.json', './bower.json', './yuidoc.json'],
	bumpType,
	version,
	message;


gulp.task('bump', function(){
	bumpType = process.argv[4];
	
	return gulp.src(jsonFiles)
		.pipe(bump({
			type: bumpType
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('doc', ['bump'], function(cb){
	fs.readFile('yuidoc.json', function(err, data){
		var doc = JSON.parse(data),
			Y = require('yuidocjs'),
			options = doc.options,
			json = (new Y.YUIDoc(options)).run(),
			builder = new Y.DocBuilder(options, json);
		builder.compile(cb);
	});
});

gulp.task('scripts', ['doc'], function(cb){
	return gulp.src('src/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('commit', ['scripts'], function(){
	var pkg = require('./package.json');
	version = pkg.version;
	message = 'Release ' + version;
		
	return gulp.src('./')
		.pipe(git.add())
		.pipe(git.commit(message));
});

gulp.task('tag', ['commit'], function(done){
	git.tag(version, message, done);
});

gulp.task('push', ['tag'], function(done){
	git.push('origin', 'master', {
		args: ' --tags'
	});
});

gulp.task('deploy', ['push']);