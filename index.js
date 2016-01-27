var fs = require('fs'),
    path = require('path'),
    utils = require('./src/utils'),
    gutils = require('gulp-util'), 
    through = require('through2'),
    requireItor = require('./src/requireIterator'),
    plugin = require('./src/plugin');

var PLUGIN_NAME = 'gulp-fecmd',
    codetpl = utils.loadTpl(__dirname + '/src/tpl/code.tpl'),
    inittpl = utils.loadTpl(__dirname + '/src/tpl/init.tpl'),
    basetpl = utils.loadTpl(__dirname + '/src/tpl/base.tpl'),
    clostpl = utils.loadTpl(__dirname + '/src/tpl/closure.tpl'),
    winbtpl = utils.loadTpl(__dirname + '/src/tpl/win-base.tpl');

function gulpFECMD(opt) {
    var dft = {
        type: 'require',
        modulesPath: "",
        commPath: ""
    };

    opt = !opt ? (utils.log("use default config : ", dft), dft) :
                                    utils.extend(true, dft, opt);
                                    
    requireIterator = requireItor(opt);
    
    var retract = opt.type === 'window' ? 1 : 3;
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
            plugin(requireItor.cbBefore, requireItor.cbAfter, buildPath, opt.type, retract);
            
            // 深度优先遍历处理require  Depth-First searching require
            moduleListObj = requireIterator(buildPath, filepath, modules, moduleListObj);
            
            // 用函数实现cmd的处理  this is the core of fecmd
            if(opt.type === 'require'){
                contents = utils.simpleTemplate(codetpl, moduleListObj.gen);
                
                // 合并文件 merge template
                var mainpath = utils.toBasePath(filepath, buildPath);
                
                contents = utils.simpleTemplate(basetpl, {
                    "modules": contents,
                    "init": utils.simpleTemplate(inittpl, mainpath)
                });
            } else if(opt.type === 'window'){
                contents = utils.simpleTemplate(clostpl, moduleListObj.gen);
                contents = utils.simpleTemplate(winbtpl, contents);
            }
            
            file.contents = new Buffer(contents.toString('utf8'));
        }
        
        this.push(file);

        if(commonModulesList.length){
            commonModulesList = utils.singleArray(commonModulesList, 'id');
            if(opt.type === 'require'){
                contents = utils.simpleTemplate(codetpl, commonModulesList);

                contents = utils.simpleTemplate(basetpl, {
                    "modules": contents,
                    "init": ""
                });
            } else if(opt.type === 'window'){
                contents = utils.simpleTemplate(clostpl, commonModulesList);
                contents = utils.simpleTemplate(winbtpl, contents);
            }

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