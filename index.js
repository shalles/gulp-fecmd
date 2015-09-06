var fs = require('fs'),
    path = require('path'),
    utils = require('./src/utils'),
    gutil = require('gulp-util'),
    through = require('through2'),
    requireItor = require('./src/requireIterator'),
    plugin = require('./src/plugin');

var PLUGIN_NAME = 'gulp-fecmd',
    PluginError = gutil.PluginError,
    codeStart = fs.readFileSync(__dirname + '/src/tpl/start.tpl').toString(),
    codetpl = fs.readFileSync(__dirname + '/src/tpl/code.tpl').toString(),
    codeInit = fs.readFileSync(__dirname + '/src/tpl/init.tpl').toString(),
    codeEnd = fs.readFileSync(__dirname + '/src/tpl/end.tpl').toString();

function gulpFECMD(opt) {
    var dft = {
        modulesPath: ""
    };

    opt = !opt ? (utils.log("use default config : ", dft), dft) :
                                    utils.extend(dft, opt, true);
                                    
    requireIterator = requireItor(opt);

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
                filepath = path.join(buildPathRelative, path.basename(file.history));
            
            console.log("buildPathRelative", buildPathRelative);
            // register Callback before & after require iterator searching 
            plugin(requireItor.cbBefore, requireItor.cbAfter, buildPath);
            
            // 深度优先遍历处理require  Depth-First searching require
            moduleList = requireIterator(buildPath, filepath, modules, moduleList);
            
            // 用函数实现cmd的处理  this is the core of fecmd
            contents = utils.simpleTemplate(codetpl, moduleList);

            // 合并文件 merge temolate
            var main = utils.simpleTemplate(codeInit, utils.removeBuildPath(filepath, buildPath));
            contents = codeStart + contents + main + codeEnd;
            
            file.contents = new Buffer(contents);
        }
       
        this.push(file);

        cb();
    });

    return stream;
};

module.exports = gulpFECMD;