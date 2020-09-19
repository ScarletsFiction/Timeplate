var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');
var rename = require('gulp-rename');
var order = require("gulp-order");
var fs = require('fs');

var compile = false;
var theHeader = `/*
  Timeplate
  A modern animation timeline built for performance and simplify
  some complex usage for animator needs.

  https://github.com/ScarletsFiction/Timeplate
*/\n`;

var dateMinify = {};
// var dateMinify = {mapFile:function(path){return path.replace('js.map', Date.now()+'.js.map')}};
gulp.task('js-es6', function(){
  removeOldMap('dist/');

  // Set the order
  var temp = gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(order([
      'a_init.js',
      'Timeplate.js',
      '**/*.js',
      'z_end.js'
    ]))
    .pipe(concat('timeplate.js'));

  if(compile)
    temp = temp.pipe(gulp.dest('dist'))
      .pipe(header(theHeader))
      .pipe(rename({extname:'.min.js'}))
      .pipe(babel({
        babelrc: false,
        plugins: [
          ["@babel/plugin-proposal-class-properties", {loose: true}]
        ],
        presets: [
          [
            "@babel/preset-env", {
              targets: {
                ie: "11"
              },
              modules: false,
              loose: false
            }
          ]
        ]
      }))
      .pipe(uglify());

  temp = temp.pipe(sourcemaps.write('.', dateMinify))
    .pipe(gulp.dest('dist'))
    .on('end', function(){
      // notifier.notify({
      //   title: 'Gulp Compilation',
      //   message: 'JavaScript was finished!'
      // });
    });

    return temp;
});

gulp.task('default', function(done){
  require('./tests/server.js');done();
  return gulp.watch(['src/**/*.js'], gulp.series('js-es6'));
});

var compile, uglify, babel;
gulp.task('enableCompile', function(done){
  uglify = require('gulp-uglify-es').default;
  babel = require("gulp-babel");
  compile = true;
  done();
});

gulp.task('compile', gulp.series(['enableCompile', 'js-es6']));

function swallowError(error){
  console.log(error.message)
  this.emit('end')
}

function removeOldMap(path){
  fs.readdir(path, function(err, files){
     for (var i = 0, len = files.length; i < len; i++) {
        if(files[i].match(/.*\.(js|css)\.map/) !== null){
          try{fs.unlinkSync(path+files[i]);}catch(e){}
        }
     }
  });
}