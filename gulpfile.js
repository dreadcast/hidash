var gulp = require('gulp'),
	Y = require('yuidocjs'),
	fs = require('fs'),
	uglify = require('gulp-uglify'),
	git = require('gulp-git'),
	bump = require('gulp-bump');

gulp.task('scripts', function(cb){
	return gulp.src('src/hidash.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

// Version
var jsonFiles = ['./package.json', './bower.json', './yuidoc.json'];

gulp.task('bump', function(){
	bumpType = process.argv[4];
	
	return gulp.src(jsonFiles)
		.pipe(bump({
			type: bumpType
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump'], function(){
	var pkg = require('./package.json'),
		v = pkg.version,
		message = 'Release ' + v;
	
	return gulp.src('./')
		.pipe(git.add())
		.pipe(git.commit(message))
		.on('end', function(){
			git.tag(v, message, function(err){
				git.push('origin', 'master', {
					args: '--tags'
				});
			});
		});
});


gulp.task('doc', function(cb){
	fs.readFile('yuidoc.json', function(err, data){
		var doc = JSON.parse(data),
			Y = require('yuidocjs'),
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
