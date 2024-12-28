const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const del = require('del');
const notify = require('gulp-notify');

const outputDir = './dist';

// Paths
const paths = {
    js: './src/js/*.js',
    html: './src/*.html',
    css: './src/css/*.less',
};

// Compile LESS to CSS and Minify
const handleError = (error) => {
    console.error(error.toString());
    this.emit('end');
};

// Clean Task
gulp.task('clean', () => {
    return del([outputDir]);
});

// Example in `css` task
gulp.task('css', () => {
    return gulp
    .src(paths.css)
    .pipe(less().on('error', handleError)) // Handle LESS compilation errors
    .pipe(cleanCSS().on('error', handleError)) // Handle CSS minification errors
    .pipe(concat('uikit.aparium.theme.min.css'))
    .pipe(gulp.dest(`${outputDir}/css`))
    .pipe(notify({ message: 'CSS task complete', onLast: true }))
    .pipe(rev.manifest('rev-manifest.json', { merge: true }))
    .pipe(gulp.dest(outputDir));
});

gulp.task('css', () => {
    return gulp
    .src(paths.css)
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(concat('uikit.aparium.theme.min.css'))
    .pipe(rev()) // Add version hash
    .pipe(gulp.dest(`${outputDir}/css`))
    .pipe(rev.manifest('rev-manifest.json', { merge: true }))
    .pipe(gulp.dest(outputDir));
});

// Minify JS
gulp.task('js', () => {
    return gulp
        .src(paths.js)
        .pipe(uglify().on('error', handleError)) // Handle CSS minification errors
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(`${outputDir}/js`))
        .pipe(notify({ message: 'CSS task complete', onLast: true }))
        .pipe(rev.manifest('rev-manifest.json', { merge: true }))
        .pipe(gulp.dest(outputDir));
});

// Update Theme References in HTML
gulp.task('html', () => {
    return gulp
        .src(paths.html)
        .pipe(replace('../dist/css/uikit-core.css', 'https://cdn.jsdelivr.net/gh/aparium/css-style/css/uikit.aparium.theme.min.css').on('error', handleError)) // Handle CSS minification errors
        .pipe(gulp.dest(outputDir))
        .pipe(notify({ message: 'CSS task complete', onLast: true }))
        .pipe(rev.manifest('rev-manifest.json', { merge: true }))
        .pipe(gulp.dest(outputDir));
});

// Watch for Changes
gulp.task('watch', () => {
    const watchOptions = { delay: 500 }; // Debounce time in milliseconds
    gulp.watch(paths.js, watchOptions, gulp.series('js'));
    gulp.watch(paths.html, watchOptions, gulp.series('html'));
    gulp.watch(paths.css, watchOptions, gulp.series('css'));
});

const isCI = process.env.CI === 'true'; // Check if running in CI/CD environment

// Build task for CI/CD with cleaning
gulp.task('build', gulp.series('clean', 'js', 'html'));

// Default task for local development (includes watch)
gulp.task('default', gulp.series('build', isCI ? () => {} : 'watch'));

