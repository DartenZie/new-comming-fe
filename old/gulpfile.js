const gulp = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const browserSync = require('browser-sync').create()
const useref = require('gulp-useref')
const gulpif = require('gulp-if')
const csso = require('gulp-csso')
const uglify = require('gulp-uglify')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const concat = require('gulp-concat')

gulp.task('sass', () => {
  return gulp
    .src('src/scss/main.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('src/css'))
})

gulp.task('babel', (done) => {
  gulp
    .src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src'))

  done()
})

gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', gulp.series('sass', 'reload'))
  gulp.watch('src/js/**/*.js', gulp.series('babel', 'reload'))
  gulp.watch('src/**/*.{html,js,css}', gulp.series('reload'))
})

gulp.task('serve', function () {
  browserSync.init({
    server: './src',
  })
})

gulp.task('reload', (done) => {
  browserSync.reload()
  done()
})

gulp.task('default', gulp.parallel('serve', 'watch'))

gulp.task('useref', () => {
  return gulp
    .src('src/*.html')
    .pipe(useref())
    .pipe(gulpif('*.css', csso()))
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulp.dest('dist'))
})
