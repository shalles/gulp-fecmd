var fs = require('fs'),
    path = require('path'),
    utils = require('./src/utils'),
    gutils = require('gulp-util'), 
    through = require('through2'),
    requireItor = require('./src/requireIterator'),
    plugin = require('./src/plugin');

var PLUGIN_NAME = 'gulp-fecmd',
    codetpl = fs.readFileSync(__dirname + '/src/tpl/code.tpl').toString(),
    inittpl = fs.readFileSync(__dirname + '/src/tpl/init.tpl').toString();
    basetpl = fs.readFileSync(__dirname + '/src/tpl/base.tpl').toString();

function gulpFECMD(opt) {
    var dft = {
        modulesPath: "",
        commPath: ""
    };

    opt = !opt ? (utils.log("use default config : ", dft), dft) :
                                    utils.extend(dft, opt, true);
                                    
    requireIterator = requireItor(opt);

    var commonModulesList = [];

    var stream = through.obj(function (file, enc, cb) {

        if (file.isStream()) {
            this.emit('error', new gutils.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        var contents, modules, moduleListObj, buildPath, buildPathRelative, filepath;

        if (file.isBuffer()) {
            contents = '',
            modules = {},
            moduleListObj = {comm: commonModulesList, gen: []},
            buildPath = file.cwd,
            buildPathRelative = file.base.slice(buildPath.length),
            filepath = path.join(buildPathRelative, path.basename(file.history));
            
            // console.log("buildPathRelative", buildPathRelative);
            // register Callback before & after require iterator searching 
            plugin(requireItor.cbBefore, requireItor.cbAfter, buildPath);
            
            // 深度优先遍历处理require  Depth-First searching require
            moduleListObj = requireIterator(buildPath, filepath, modules, moduleListObj);
            
            // 用函数实现cmd的处理  this is the core of fecmd
            contents = utils.simpleTemplate(codetpl, moduleListObj.gen);
            

            // 合并文件 merge temolate
            var mainpath = utils.toBasePath(filepath, buildPath);
            
            contents = utils.simpleTemplate(basetpl, {
                "modules": contents,
                "init": utils.simpleTemplate(inittpl, mainpath)
            });
            
            file.contents = new Buffer(contents);
        }
        
        this.push(file);

        if(commonModulesList.length){
            commonModulesList = utils.singleArray(commonModulesList, 'id');
            contents = utils.simpleTemplate(codetpl, commonModulesList);

            contents = utils.simpleTemplate(basetpl, {
                "modules": contents,
                "init": ""
            });

            var commFile = new gutils.File({
                cwd: buildPath,
                base: file.base,
                path: path.join(file.base, "common.js"),
                contents: new Buffer(contents)
            });
            this.push(commFile);

        }

        cb();
    });
    
    // console.log("stream:----------------------------\n", stream);

    return stream;
};

module.exports = gulpFECMD;