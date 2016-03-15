var path = require('path'),
    fs = require('fs'),
    gutil = require('gulp-util'), 
    utils = require('./utils.js'),
    Callbacks = require('./lib/callback.js');

var cbBefore = new Callbacks(),
    cbAfter = new Callbacks();

function fireback(cb, args) {
    cb.fire(args);
    return args;
}

// 配置文件只需获取一次
function getModuleFilesPath(bpath, mpath){
    if(!getModuleFilesPath.path){
        var bowerrc = path.join(bpath, '.bowerrc');

        utils.log("检查配置文件(check).bowerrc: ", bowerrc);

        if(!mpath && fs.existsSync(bowerrc) && (mpath = utils.readjson(bowerrc).directory)){
            utils.log("检查配置项(check)bowerrc.directory: ", mpath);
        }else {
            mpath = "./bower_components";
            utils.log("检查默认(check)bower_compontents: ", mpath);
        }
        getModuleFilesPath.path = path.resolve(bpath, mpath);
    }

    return getModuleFilesPath.path;
}
function findInModulePackage(bpath, mpath, reqPath) {

    mpath = (mpath && fs.existsSync(path.resolve(bpath, mpath, reqPath))) ? 
                            mpath : getModuleFilesPath(bpath, mpath);

    var rmfp = path.resolve(mpath, reqPath),
        jsonpath = path.join(rmfp, 'bower.json'); // 模块中的bower.json

    try {
        // 读取成功 reqPath = require modle file path
        gutil.log(gutil.colors.yellow("检查(check)bower directory中模块: "), reqPath);
        reqPath = utils.readjson(jsonpath).main;
    } catch (error) {
        // gutil.log(gutil.colors.red('[gulp-fecmd error]'));
        console.log(gutil.colors.red('[gulp-fecmd error]'), error.message);
        return false;
    }
    if(fs.existsSync(path.join(rmfp, reqPath))){
        // TODO: 返回相对路径 相对build path
        reqPath = path.join(rmfp, reqPath);
        gutil.log(gutil.colors.green("找到模块主文件: "), reqPath);
        return reqPath;
    }
    return false;
}

function exportReqI(config) {
    var exportType = config.type || 'require',
        modulesPath = config.modulesPath,
        commonPath = config.commPath,
        aliasObj = config.alias; 

    function requireIterator(buildPath, filepath, modules, moduleListObj) {

        var readpath = path.isAbsolute(filepath) && fs.existsSync(filepath) ? 
                                    filepath : path.join(buildPath, filepath),
            content = fs.readFileSync(readpath),
            filebase = path.dirname(filepath),
            regx = /require\(['"](.+)['"]\)/g,
            match;

        content = content.toString('utf8');

        match = utils.clearJs(content).match(regx);

        // 处理检查require前的工作 为扩展语言如coffee等
        content = fireback(cbBefore, {
            cnt: content,
            fp: filepath
        }).cnt;

        if(match){
            // 当前文件中是否有require项 这里只是简单的regex match 之后需优化排除注释里的require
            var replaceHandle = function($0, $1) {
                // 排除注释掉的require
                if(match.indexOf($0) === -1) return $0;
                
                // console.log('$1: ', $1);
                // 处理common
                var reqPath, flag = $1.slice(-2) === '!!' ? 2 : 1;
                $1 = reqPath = flag === 2 ? $1.slice(0, -2): $1;

                // console.log("flag:------------", $1, "----", flag);
                // 处理绝对路径的情况
                reqPath = path.isAbsolute(reqPath) ? reqPath : path.join(filebase, reqPath);
                // TODO: 触发
                //var absReqPath = path.join(buildPath, reqPath);
                var absReqPath = reqPath.indexOf(buildPath) === 0 ? reqPath : path.join(buildPath, reqPath);
                if (!fs.existsSync(absReqPath)) {
                    // 默认ext是.js
                    if (fs.existsSync(absReqPath + '.js')) {
                        reqPath += '.js';
                    } else {
                        // console.log('come in')
                        // 没有找到文件在检查是否有别名
                        for(var i in aliasObj){
                            var alias = i + '/';
                            // console.log('alias:', alias)
                            if($1.indexOf(alias) > -1){
                                var name = aliasObj[i] + '/';
                                // console.log('name:', name);
                                return replaceHandle($0, $1.replace(alias, name));
                            }
                        }
                        // 检查是否在module中
                        reqPath = modules[$1] || findInModulePackage(buildPath, modulesPath, $1);
                        // 模块库里面也没有
                        if (!reqPath) {
                            throw Error("error: can not find file(找不到文件) " + absReqPath);
                        }else{
                            reqPath = utils.toBasePath(reqPath, buildPath)
                            modules[$1] = reqPath;
                        }
                    }
                }

                var id = utils.convertID(reqPath);

                if (!modules[id]) {
                    // 处理循环引用
                    modules[id] = flag;
                    gutil.log(gutil.colors.cyan("dependence(处理依赖): "), reqPath);
                    requireIterator(buildPath, reqPath, modules, moduleListObj);
                }
                
                reqPath = utils.toBasePath(reqPath, buildPath);

                return exportType === 'require' ? 'require("' + reqPath + '")' : 
                        'window.__MODULES["' + id + '"]' + (utils.inArray(path.extname(reqPath), ['.tpl', '.json']) ? '()': '');
            }

            content = content.replace(regx, replaceHandle);
        }
        
        //导出前的处理
        content = fireback(cbAfter, {
            cnt: content,
            fp: filepath
        }).cnt;

        filepath = utils.toBasePath(filepath, buildPath);

        // 格式封装 导出tpl: code.tpl需要的数据
        var curID = utils.convertID(filepath);
        if(modules[curID] !== 8){
            // console.log("modules[]----------", modules);
            var tgt = 'gen'
            switch(modules[curID]){
                case 1: 
                    tgt = 'gen';
                    break;
                case 2:
                    tgt = 'comm';
                    break;
                default: 
                    break;
            }
            moduleListObj[tgt].push({
                id: curID,
                path: filepath,
                code: content
            });
        }
            
        modules[curID] = 8;

        return moduleListObj;
    }

    return requireIterator;
}

exportReqI.cbBefore = cbBefore;
exportReqI.cbAfter = cbAfter;

module.exports = exportReqI;