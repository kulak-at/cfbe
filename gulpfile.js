var gulp       = require('gulp');
    gutil      = require('gulp-util');
    watch      = require('gulp-watch');
    merge      = require('merge-stream');
    plumber    = require('gulp-plumber');
    mbf        = require('main-bower-files');
    concat     = require('gulp-concat');
    jshint     = require('gulp-jshint');
    stylish    = require('jshint-stylish');
    less       = require('gulp-less-sourcemap');
    sourcemaps = require('gulp-sourcemaps');
    removeUst  = require('gulp-remove-use-strict');
    argv       = require('yargs').argv;
    livereload = require('gulp-livereload');
    postcss    = require('gulp-postcss');
    autoprefixer= require('autoprefixer-core');
    template    = require('gulp-template');
    gulpif      = require('gulp-if');
    injectReload= require('gulp-inject-reload');


var onError = function (err) {
  gutil.beep();
  gutil.log(err);
};

var ENV = argv.e != undefined ? argv.e : 'dev';

gulp.task("compile_public", function() {
  var git = require('git-rev');
  git.log(function(log_arr) {
    last_commit = log_arr[0];
    merge(
      gulp.src(['app/scripts/**/*.js', 'app/scripts/*.js'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        // .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        // .pipe(removeUst())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/scripts'))
        .pipe(livereload({auto:false})),
      gulp.src(['app/assets/**/*.*', 'app/assets/**/**/*.*', '!app/assets/index.html']).pipe(gulp.dest('./build')),
      gulp.src(['app/assets/index.html'])
        .pipe(template({
          timestamp: +(new Date()),
          time: (new Date()).toISOString(),
          git_hash: last_commit[0],
          git_message: last_commit[1]
        }))
        .pipe(gulpif(argv.livereload, injectReload()))
        .pipe(gulp.dest('./build'))
    );
  });
});

gulp.task("compile_bower", function() {
  return merge(
    gulp.src(mbf(), { base: 'app/bower_components'}).pipe(concat('vendor.js')).pipe(gulp.dest('build/scripts')),
    gulp.src(['app/bower_components/**/*']).pipe(gulp.dest('./build/bower_components')) // copy all of them until we figure out something better
    );
});

gulp.task('compile_bootstrap', function() {
    // moves all neseceary files
    return merge(

        gulp.src('bower_components/bootstrap/dist/js/*')
        .pipe(gulp.dest('./build/vendor/js')),

        gulp.src('bower_components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('./build/vendor/fonts'))
    );
});

gulp.task("compile_less", function() {
    return merge(
      gulp.src('app/vendor/**/*.less').pipe(less()).pipe(concat('vendor.css')).pipe(gulp.dest('build/styles')),
      gulp.src('app/styles/styles.less')
        // .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postcss([autoprefixer]))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/styles'))
        .pipe(livereload({auto:false}))
    );
});


gulp.task('compile', ['compile_less', 'compile_public', 'compile_bower', 'compile_bootstrap']);

var run_task = function(name) {
    return function() {
        gulp.start([name]);
    }
}

gulp.task("watch", function() {
    watch('app/styles/**/*.less',      run_task('compile_less'));
    watch('app/scripts/**/*.js',       run_task('compile_public'));
    watch('app/assets/**/*',           run_task('compile_public'));
    watch('app/bower_components/**/*', run_task('compile_bower'));
    watch('app/bower_components/bootstrap/*', run_task('compile_bootstrap'));

    livereload.listen();

    run_task('compile')();
});
