#gulp-fecmd

###what's gulp-fecmd
gulp-fecmd is a tool that will help FE coding js with CMD(Common Module Definition) free without quote any third-party library in your program;

###install

```
npm install gulp-fecmd
```

**`version`** 1.0.6

add support bower module, and more please look down "gulpfile.js" and "a.js"

**`version`** 1.0.7

support .json

###Documentation

```js
//gulpfile.js

var fecmd = require('gulp-fecmd');

gulp.task('scripts', function() {
    var data =  gulp.src('js/a.js')
                    .pipe(sourcemaps.init());



    // you should use it before minify or uglify and ...
    // support bower module like 
    // fecmd({
    //      modulePath: "bower directory"
    // })
    // if you don't give modulePath, default is the directory in ".bowerrc" file 
    // or the folder bower_components in you build path but all the first is you 
    // scripts folder then bower module
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

```html
<!-- file index.html -->
<script src="js/a.js"></script>

```

```js
// file a.js

var b = require('lib/b.js'); // '[./]lib/b[.js]'
var tpl = require('tpl/xx.tpl'); //return a string
var json = require('data/data.json'); //return the Object
// or
// require('c.js');
// require('d');
// 
// if your version is 1.0.6 or newer you can quote module 
// from bower module lick this require('jquery'), without 
// extname and without a filename jquery or jquery.js file
// in the same dir with a.js
require('jquery');


/* do something */
var console.log(b.c);

```

```js
// file lib/b.js

// other code do something
// such
// require()...
// var a,b,c...
// function(){} ...

//export your module
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


**template**

require support template (*.tpl) like this file "xx.tpl"
and export a string

```html
<div>
    {{#list}}
    <span>{{supportTemplate}}</span>
    {{/list}}
</div>
```
export
```js
"<div>\n    {{#list}}\n    <span>{{supportTemplate}}</span>\n    {{/list}}\n</div>"
```



