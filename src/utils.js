var fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util');

var PLUGIN_NAME = 'gulp-fecmd',
    regexID = /[^a-zA-Z0-9]/g,
    flagWin = /\w:/.test(process.cwd());

function log() {
    //console.log('---- ' + PLUGIN_NAME + ' log ------------------------------------\n',
                                        // Array.prototype.join.call(arguments, "\n"));
    // console.log(gutil.colors.yellow);
    gutil.log(gutil.colors.yellow(arguments[0]), Array.prototype.slice.call(arguments, 1).join("\n"));
}

function simpleTemplate(str, data) {

    if (!str || !data) return '';

    var type = Object.prototype.toString.call(data),
        strRes = '',
        regex = /\{\{\s*(\w+)\s*\}\}/g;

    switch (type) {
        case '[object Array]':
            for (var i = 0, len = data.length; i < len; i++) {
                strRes += simpleTemplate(str, data[i]);
            }
            break;
        case '[object Object]':
            strRes = str.replace(regex, function ($0, $1) {
                return data[$1];
            });
            break;
        case '[object String]':
            strRes = str.replace(regex, data);
            break;
        default:
            strRes = '';
    }

    return strRes;
}

function convertID(path) {
    return path.replace(regexID, "");
}

function convertWintoInux(path){
    return flagWin ? path.replace(/[\\]/g, "/") : path;
}

function classof(o) {
    // if (o === null) return "Null";
    // if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8,-1);
}

function extend(){
    var iterator = {
        stack: [],
        reset: function(){
            stack = [];
        },
        watch:function(co, cb){ // co对象或数组 这里不做额外判断
            if(this.stack.indexOf(co) > -1) return;
            this.stack.push(co), cb();
        }
    };

    function copy(to, from, deep){
        for(var i in from){
            var fi = from[i];
            if(!deep){
                if(fi !== undefined){
                    to[i] = fi;
                }
            }else{
                var classFI = classof(fi), 
                    isArr = classFI === 'Array', 
                    isObj = classFI === 'Object';
                if(isArr || isObj){
                    var ti = to[i],
                        tiC = classof(ti);

                    isArr ? tiC !== 'Array' && (ti = []) : 
                            tiC !== 'Object' && (ti = {});

                    iterator.watch(fi, function(){
                        copy(ti, fi, deep);
                    })
                }else{
                    if(fi !== undefined){
                        to[i] = fi;
                    }
                }
            }
        }
    }
    var re, len = arguments.length, deep, i;
    deep = arguments[len-1] === true ? (len--, true): false;
    arguments[0] === true ? (i = 2, re = arguments[1]): (i = 0, re = {});
    for(i; i < len; i++){
        classof(arguments[i]) === 'Object' && copy(re, arguments[i], deep);
    }

    return re;
}

function readjson(filepath){
    var json;
    try{
        json = JSON.parse(fs.readFileSync(filepath).toString());
    } catch(e){
        json = {}
    }
    return json;
}

function removeBuildPath(p, bp){
    if(p.indexOf(bp) === 0){
        p = p.slice(bp.length);
    }
    return p;
}

function toBasePath(p, bp){
    
    return convertWintoInux(removeBuildPath(p, bp));
}

function singleArray(arr, id){
    var obj = {}
    for(var i in arr){
        var aio = arr[i];
        obj[aio[id]] = aio;
    }
    arr = [];
    for(var j in obj){
        arr.push(obj[j]);
    }
    return arr;
}

module.exports = {
    log: log,
    simpleTemplate: simpleTemplate,
    convertID: convertID,
    flagWin: flagWin,
    toBasePath: toBasePath,
    singleArray: singleArray,
    convertWintoInux: convertWintoInux,
    extend: extend,
    readjson: readjson,
    removeBuildPath: removeBuildPath
}