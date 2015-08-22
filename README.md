#gulp-fecmd

###what's gulp-fecmd
gulp-fecmd is a toolkit that will help FE coding js with CMD(Common Module Definition) free and not quote third-party in your program;

###install

```
npm install gulp-fecmd
```

###Documentation

```js
//gulpfile.js

var fecmd = require('gulp-fecmd');

gulp.task('scripts', function() {
    var data =  gulp.src(config.scripts.src + scriptSuffix)
                    .pipe(sourcemaps.init());



    // you should use it before minify or uglify and ...
    data = data.pipe(fecmd());
    


    config.minify && (data = data.pipe(uglify()).pipe(sourcemaps.write()));
    config.livereload && data.pipe(livereload());
    config.version ?
        data.pipe(rev())
            .pipe(gulp.dest(config.scripts.exp))
            .pipe(rev.manifest('js-map.json'))
            .pipe(gulp.dest(config.tmp)) : 
        data.pipe(gulp.dest(config.scripts.exp));
});

```

**program file**
```js
// a.js

var b = require('lib/b.js'); // '[./]lib/b[.js]'
// require('c.js');
// require('d');

var console.log(b.c);

```

```js
//lib/b.js

// require()...
// var a,b,c...
// function(){} ...

//*
module.exports = {
    c: 2,
    cc: 23
}
/*/
//or
exports.c = 2;
exports.cc = 23;
//*/
//
```
