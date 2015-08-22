var fs = require('fs'),
    path = require('path'),
    utils = require('./src/utils'),
    gutil = require('gulp-util'),
    through = require('through2'),
    requireIterator = require('./src/requireIterator');
    
var PLUGIN_NAME = 'gulp-fecmd',
    PluginError = gutil.PluginError,
    codeStart = fs.readFileSync(__dirname + '/src/tpl/start.tpl').toString(),
    codetpl = fs.readFileSync(__dirname + '/src/tpl/code.tpl').toString(),
    codeInit = fs.readFileSync(__dirname + '/src/tpl/init.tpl').toString(),
    codeEnd = fs.readFileSync(__dirname + '/src/tpl/end.tpl').toString();

function callback(){
    // 清空 clear callback
    requireIterator.cbBefore.empty();
    requireIterator.cbAfter.empty();
    
    //格式缩进 format require code tab
    requireIterator.cbAfter.add(function(args){
        args.cnt = args.cnt.replace(/\n/g, '\n\t\t\t');
        return;
    });
    // 处理不同ext文件 template require like require('htmlcode.tpl') export a safe string;
    requireIterator.cbBefore.add(function(args){
        switch(path.extname(args.fp)){
            case '.tpl': 
                args.cnt = "module.exports=" + JSON.stringify(args.cnt);
        }
        return;
    })
}

function gulpFECMD(opt) {
    var dft = {};
    if (!opt) {
        utils.log("use default config : ", dft);
    }
        
    var stream = through.obj(function (file, enc, cb) {

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            var contents = '',
                modules = {},
                moduleList = [],
                buildPath = file.cwd,
                buildPathRelative = file.base.slice(buildPath.length),
                filepath = path.join(buildPathRelative, file.sourceMap.file);
            
            // register Callback before & after require iterator searching 
            callback(buildPath);
            
            // 深度优先遍历处理require  Depth-First searching require
            moduleList = requireIterator(buildPath, filepath, modules, moduleList);
            
            // 用函数实现cmd的处理  this is the core of fecmd
            contents = utils.simpleTemplate(codetpl, moduleList);

            // 合并文件 merge temolate
            contents = codeStart + contents + utils.simpleTemplate(codeInit, filepath) + codeEnd;
            
            file.contents = new Buffer(contents);
        }
       
        this.push(file);

        cb();
    });

    return stream;
};

module.exports = gulpFECMD;