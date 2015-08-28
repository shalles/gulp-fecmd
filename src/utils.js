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

module.exports = {
    log: log,
    simpleTemplate: simpleTemplate,
    convertID: convertID,
    flagWin: flagWin,
    convertWintoInux: convertWintoInux
}