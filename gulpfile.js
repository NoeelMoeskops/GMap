var gulp         = require('gulp'),
    gulpif       = require('gulp-if'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify       = require('gulp-uglify'),
    ts           = require('gulp-typescript');

//typescript
gulp.task('default', ['build']);
gulp.task('build', ['b-es3', 'b-es5', 'b-es6']);

gulp.task('b-es3', function () {
    typescript("es3");
});
gulp.task('b-es5', function () {
    typescript("es5");
});
gulp.task('b-es6', function () {
    typescript("es6");
});
function typescript(esVersion) {
    var compress;
    if (esVersion === 'es6') {
        compress = "max";
    } else {
        compress = "min";
    }
    var tsProject = ts.createProject('tsconfig.json', {
        outFile: "./dist/Gmap."+esVersion+"."+compress+".js",
        target: esVersion
    });
    return tsProject.src()
        .pipe(tsProject())
        // .pipe(sourcemaps.init())
        .pipe( gulpif(compress === "min", uglify()) )
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(''));
        // .pipe(browserSync.stream());
}
