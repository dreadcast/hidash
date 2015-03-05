var gulp = require('gulp'),
	Y = require('yuidocjs'),
	uglify = require('gulp-uglify');

	
	gulp.task('scripts', function(cb){
		return gulp.src('src/hidash.js')
			.pipe(uglify())
			.pipe(gulp.dest('dist'));
	});
	
	gulp.task('doc', function(cb){
		return gulp.src('src/hidash.js')
		
		fs.readFile('./yuidoc.json', function(err, data){
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
	