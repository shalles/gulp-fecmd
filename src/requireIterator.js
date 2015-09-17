var path = require('path'),
    fs = require('fs'),
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

        utils.log("检查\nbuild path: " + bpath, "配置文件.bowerrc: " + bowerrc);

        if(!mpath && fs.existsSync(bowerrc) && (mpath = utils.readjson(bowerrc).directory)){
            utils.log("检查配置bowerrc.directory: ", mpath);
        }else {
            mpath = "./bower_components";
            utils.log("检查默认bower.directory: ", mpath);
        }
        getModuleFilesPath.path = path.resolve(bpath, mpath);
    }

    return getModuleFilesPath.path;
}
function findInModulePackage(bpath, mpath, p) {

    mpath = (mpath && fs.existsSync(path.resolve(bpath, mpath, p))) ? 
                            mpath : getModuleFilesPath(bpath, mpath);

    var rmfp = path.resolve(mpath, p),
        jsonpath = path.join(rmfp, 'bower.json'); // 模块中的bower.json

    try {
        // 读取成功 p = require modle file path
        utils.log("检查bower directory中是否存在以下模块", p);
        p = utils.readjson(jsonpath).main;
        utils.log("找到模块主文件", p);
    } catch (error) {
        console.log(error.message);
        return false;
    }
    if(fs.existsSync(path.join(rmfp, p))){
        // TODO: 返回相对路径 相对build path
        
        return path.join(rmfp, p);
    }
    return false;
}

function exportReqI(config) {
    var modulesPath = config.modulesPath,
        commonPath = config.commPath; 

    function requireIterator(buildPath, filepath, modules, moduleListObj) {

        var readpath = path.isAbsolute(filepath) && fs.existsSync(filepath) ? 
                                    filepath : path.join(buildPath, filepath),
            content = fs.readFileSync(readpath),
            filebase = path.dirname(filepath),
            regx = /require\(['"](.+)['"]\)/g,
            match;

        content = content.toString();

        var requireList = (content.replace(/\/\/.*\n/g, '\n').match(regx) || []).map(function(x){
            x = x && regx.exec(x) || [];

            console.log("x------------------: ", x, x[1]);
            return x[1] || '';
        });

        // 处理检查require前的工作 为扩展语言如coffee等
        content = fireback(cbBefore, {
            cnt: content,
            fp: filepath
        }).cnt;

        // 当前文件中是否有require项 这里只是简单的regex match 之后需优化排除注释里的require
        content = content.replace(regx, function($0, $1) {
            // 排除注释掉的require
            //if(requireList.indexOf($1) === -1) return $0;

            // 处理common
            var p, flag = $1.slice(-2) === '!!' ? 2 : 1;
            $1 = p = flag === 2 ? $1.slice(0, -2): $1;

            console.log("flag:------------", $1, "----", flag);
            // 处理绝对路径的情况
            p = path.isAbsolute(p) ? p : path.join(filebase, p);
            // TODO: 触发
            //var wp = path.join(buildPath, p);
            var wp = p.indexOf(buildPath) === 0 ? p : path.join(buildPath, p);
            if (!fs.existsSync(wp)) {
                // 默认ext是.js
                if (fs.existsSync(wp + '.js')) {
                    p += '.js';
                } else {

                    p = modules[$1] || findInModulePackage(buildPath, modulesPath, $1);
                    p = utils.toBasePath(p, buildPath)
                    if (!p) {
                        // 模块库里面也没有
                        throw Error("error: can not find file(找不到文件) " + wp);
                    }else{
                        modules[$1] = p;
                    }
                }
            }

            var id = utils.convertID(p);

            if (!modules[id]) {
                // 处理循环引用
                modules[id] = flag;
                utils.log("dependence(处理依赖): ", p);
                requireIterator(buildPath, p, modules, moduleListObj);
            }
            
            p = utils.toBasePath(p, buildPath);

            return 'require("' + p + '")';
        });

        //导出前的处理
        content = fireback(cbAfter, {
            cnt: content,
            fp: filepath
        }).cnt;

        filepath = utils.toBasePath(filepath, buildPath);

        // 格式封装 导出tpl: code.tpl需要的数据
        var curID = utils.convertID(filepath);
        if(modules[curID] !== 8){
            console.log("modules[]----------", modules);
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