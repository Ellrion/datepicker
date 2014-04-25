var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('default', function() {
    gulp.watch('./src/less/*.less', ['less']);
});

gulp.task('less', function() {
    gulp.src('./src/less/ellrion-datepicker.less')
        .pipe(less({ compress: true, sourceMap: true }))
        .pipe(gulp.dest('./src/css'));
});