# gulp-fecmd

### what's gulp-fecmd
gulp-fecmd is a tool that will help FE coding js with CMD(Common Module Definition) free without quote any third-party library in your program;

### install

```
npm install gulp-fecmd
```

### new version

**`version`** 1.1.0 <br>
support common file

if there are some files are common in your project, you can separate them from page file,
and just add "!!" at end of module path like such

```js
require('jquery!!');
require('./lib/comm.js!!');
require('./lib/comm.tpl!!');
require('./lib/comm.json!!');
require('./lib/comm.es6!!');
// more ...
```
and the common.js file will export with your gulp.dist

so you could add a new file source in you page file

```html
    <!-- add common.js before app.js -->
    <script src="../js/common.js"></script>
    <script src="../js/app-1.js"></script>
```

**`version`** 1.0.8 <br>
support .es6 
more infomation [ https://babeljs.io/docs/learn-es2015/ ](https://babeljs.io/docs/learn-es2015/)


**`version`** 1.0.7 <br>
support .json


**`version`** 1.0.6

add support bower module, and more please look down "gulpfile.js" and "a.js"



### Documentation

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
    data = data.pipe(fecmd({type: 'window'})); //export type mode default: require 
    
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
var es6 = require('lib/file.es6'); // return es5 code
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
**es6**

```js
// file.es6

class Calc {
    constructor() {
        console.log('Calc constructor');
    }
    add(a, b) {
        return a + b;
    }
}

module.exports = Calc;

// usage
// var c = new Calc();
// console.log(c.add(1, 2));
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

## test demo 

[ https://www.npmjs.com/package/fepro ](https://www.npmjs.com/package/fepro)

$ sudo npm install -g fepro
$ fepro -b gulp "your_demo_path"
$ cd "your_demo_path"
$ fepro -i gulp
$ gulp


