var gulp = require('gulp'),
	Y = require('yuidocjs'),
	fs = require('fs'),
	uglify = require('gulp-uglify'),
	beautify = require('js-beautify').js_beautify,
	git = require('gulp-git'),
	_ = require('./src/hidash.js');

gulp.task('scripts', function(cb){
	return gulp.src('src/hidash.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('version', function(cb){
	var version = process.argv[4];

	_.eachAsync(['yuidoc', 'bower', 'package'], function(filename, index, cursor){
		fs.readFile(filename + '.json', {
			encoding: 'utf8'
		}, function(err, data){
			if(err)
				throw new Error('Error reading ' + filename + '.json');
			
			var pack = JSON.parse(data);
			
			pack.version = version;
			
			fs.writeFile(filename + '.json', beautify(JSON.stringify(pack), {
				indent_char: '\t',
				indent_size: 1
			}), {
				encoding: 'utf8'
			}, cursor);
		});
	}, function(){
		git.tag(version, 'Changed version to ' + version, null, function(){
			console.info('Version updated to ' + version);
		});
	});
});

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

// 	console.log(conf.scripts);

gulp.task('default', ['watch', 'scripts', 'doc']);
