const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const notify = require('gulp-notify');


// Dynamic Import for ESM Modules
const loadRev = async () => (await import('gulp-rev')).default;
const loadDel = async () => (await import('del')).deleteSync;

const outputDir = './dist';

// Paths
const paths = {
    js: './src/js/*.js',
    html: './src/*.html',
    css: './src/css/*.less',
};

// Error Handler
const handleError = (error) => {
    console.error(error.toString());
    this.emit('end');
};

// Clean Task
gulp.task('clean', async () => {
    const { deleteSync } = await import('del'); // Dynamically import del
    // deleteSync(`${outputDir}/css`); // Use deleteSync to clean the directory  
    // deleteSync(`${outputDir}/js`); // Use deleteSync to clean the directory    
    deleteSync(`${outputDir}/*`); // Deletes all files and subdirectories inside the directory
});


// Compile LESS to CSS and Minify
gulp.task('css', async () => {
    const rev = await loadRev();
    return gulp
    .src(paths.css)
    .pipe(less().on('error', handleError))
    .pipe(cleanCSS().on('error', handleError))
    .pipe(concat('uikit.aparium.theme.min.css'))
    .pipe(rev()) // Add version hash
    .pipe(gulp.dest(`${outputDir}/css`))
    .pipe(rev.manifest('rev-manifest.json', { merge: true }))
    .pipe(gulp.dest(outputDir))
    .pipe(notify({ message: 'CSS task complete', onLast: true }));
});

// Minify JS
gulp.task('js', async () => {
    const rev = await loadRev();
    return gulp
    .src(paths.js)
    .pipe(uglify().on('error', handleError))
    .pipe(concat('app.min.js'))
    .pipe(rev()) // Add version hash
    .pipe(gulp.dest(`${outputDir}/js`))
    .pipe(rev.manifest('rev-manifest.json', { merge: true }))
    .pipe(gulp.dest(outputDir))
    .pipe(notify({ message: 'JS task complete', onLast: true }));
});

// Update Theme References in HTML
gulp.task('html', () => {
    return gulp
    .src(paths.html)
    .pipe(replace('../dist/css/uikit-core.css', 'https://cdn.jsdelivr.net/gh/aparium/css-style/css/uikit.aparium.theme.min.css').on('error', handleError))
    .pipe(gulp.dest(outputDir))
    .pipe(notify({ message: 'HTML task complete', onLast: true }));
});

// Watch for Changes
gulp.task('watch', () => {
    const watchOptions = { delay: 500 };
    gulp.watch(paths.js, watchOptions, gulp.series('js'));
    gulp.watch(paths.html, watchOptions, gulp.series('html'));
    gulp.watch(paths.css, watchOptions, gulp.series('css'));
});

const isCI = process.env.CI === 'true'; // Check if running in CI/CD environment
// Build Task    
gulp.task('build', gulp.series('clean', 'js', 'html'));
// Default Task
gulp.task('default', gulp.series('build', isCI ? () => {} : 'watch'));