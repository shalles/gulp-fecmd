var fs = require('fs'),
    path = require('path');

var PLUGIN_NAME = 'gulp-fecmd',
    regexID = /[^a-zA-Z0-9]/g,
    flagWin = /\w:/.test(process.cwd());

function log() {
    console.log('---- ' + PLUGIN_NAME + ' log ------------------------------------\n',
                                        Array.prototype.join.call(arguments, "\n"));
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
    function copy(to, from, deep){
        for(var i in from){
            var fi = from[i];
            if(deep && fi && !fi.nodeType && fi !== fi[i]){
                var classFI = classof(fi), 
                    isArr = classFI === 'Array', 
                    isObj = classFI === 'Object';
                if(isArr || isObj){
                    isArr && (to[i] = []);
                    isObj && (to[i] = {});

                    iterator.stack.push(fi);
                    log("iterator", iterator.count);

                    if(iterator.count++ < 10){
                        copy(to[i], fi, deep);
                    } else {
                        log("there Object or Array deep more than" + iterator.count);
                        console.log("copy statck is ", iterator.stack);
                    }
                }else{
                    iterator = {
                        count: 1,
                        stack: []
                    };
                }
            }
            if(from[i] !== undefined){
                to[i] = from[i];
            }
        }
    }
    var iterator = {
        count: 1,
        stack: []
    };
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