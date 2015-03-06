var gulp = require('gulp'),
	Y = require('yuidocjs'),
	fs = require('fs'),
	uglify = require('gulp-uglify'),
	git = require('gulp-git'),
	bump = require('gulp-bump'),
	fs = require('fs-extra');

var jsonFiles = ['./package.json', './bower.json', './yuidoc.json'],
	tmpDir = './../tmp',
	bumpType,
	version,
	message,
	yuiOptions;


// Bump version
gulp.task('bump', function(){
	bumpType = process.argv[4];
	
	return gulp.src(jsonFiles)
		.pipe(bump({
			type: bumpType
		}))
		.pipe(gulp.dest('./'));
});

// Build & commit
gulp.task('scripts', ['bump'], function(cb){
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
	return git.tag(version, message, done);
});




// Parse doc, checkout gh-pages & compile
gulp.task('doc', ['tag'], function(done){
	fs.readFile('yuidoc.json', function(err, data){
		var doc = JSON.parse(data),
			Y = require('yuidocjs');
		
		yuiOptions = doc.options;
		
		var yui = new Y.YUIDoc(yuiOptions),
			yuiJson = yui.run(),
			builder = new Y.DocBuilder(yuiOptions, yuiJson);
		
		builder.compile(function(){
 			fs.removeSync(tmpDir);
			fs.move(yuiOptions.outdir, tmpDir + '/doc', {
				clobber: true
			}, done);
		});
	});
});
gulp.task('checkoutGhPages', ['doc'], function(done){
	git.checkout('gh-pages', function(){
		fs.move(tmpDir + '/doc', yuiOptions.outdir, {
			clobber: true
		}, done);
	});
});

	
// Commit & tag docs
gulp.task('commitdoc', ['checkoutGhPages'], function(){
	return gulp.src('./')
		.pipe(git.add())
		.pipe(git.commit('Release ' + version));
});

gulp.task('pushdoc', ['commitdoc'], function(done){
	return git.push('origin', 'gh-pages', done);
});








// Return to master & push
gulp.task('checkoutMaster', ['pushdoc'], function(done){
	git.checkout('master', done);
});

gulp.task('push', ['checkoutMaster'], function(done){
	return git.push('origin', 'master', {
		args: ' --tags'
	}, done);
});

gulp.task('deploy', ['push']);

