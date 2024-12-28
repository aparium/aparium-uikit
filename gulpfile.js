const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');

// Paths
const paths = {
    js: './src/js/*.js',
    html: './src/*.html',
    css: './src/css/*.less',
};

// Compile LESS to CSS and Minify
gulp.task('css', () => {
    return gulp
        .src(paths.css)
        .pipe(less()) // Compile LESS to CSS
        .pipe(cleanCSS()) // Minify CSS
        .pipe(concat('uikit.aparium.theme.min.css'))
        .pipe(gulp.dest('./dist/css'));
});

// Minify JS
gulp.task('js', () => {
    return gulp
        .src(paths.js)
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./dist/js'));
});

// Update Theme References in HTML
gulp.task('html', () => {
    return gulp
        .src(paths.html)
        .pipe(replace('../dist/css/uikit-core.css', 'https://cdn.jsdelivr.net/gh/aparium/css-style/css/uikit.aparium.theme.min.css'))
        .pipe(gulp.dest('./dist'));
});

// Watch for Changes
gulp.task('watch', () => {
    gulp.watch(paths.js, gulp.series('js'));
    gulp.watch(paths.html, gulp.series('html'));
    gulp.watch(paths.css, gulp.series('css'));
});

// Build Task
gulp.task('build', gulp.series('css', 'js', 'html'));

// Default Task
gulp.task('default', gulp.series('build', 'watch'));