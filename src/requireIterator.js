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

        if(!mpath && fs.existsSync(bowerrc)){
                
            if(mpath = utils.readjson(bowerrc).directory){
                utils.log("检查配置bowerrc.directory: ", mpath);
            }else {
                mpath = "./bower_components";
                utils.log("检查默认bower.directory: ", mpath);
            }
        }
        getModuleFilesPath.path = path.resolve(bpath, mpath);
    }

    return getModuleFilesPath.path;
}
function findInModulePackage(bpath, mpath, p) {
    //.bowerrc
    //"directory": "src/scripts/modules"
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
        return path.join(rmfp, p);
    }
    return false;
}

function exportReqI(config) {
    var modulesPath = config.modulesPath;

    function requireIterator(buildPath, filepath, modules, moduleList) {

        var readpath = path.isAbsolute(filepath) && fs.existsSync(filepath) ? 
                                    filepath : path.join(buildPath, filepath),
            content = fs.readFileSync(readpath),
            filebase = path.dirname(filepath),
            regx = /require\(['"](.+)['"]\)/g,
            match;

        content = content.toString();

        // 处理检查require前的工作
        content = fireback(cbBefore, {
            cnt: content,
            fp: filepath
        }).cnt;

        // 当前文件中是否有require项 这里只是简单的regex match 之后需优化排除注释里的require
        match = content.match(regx);

        // 没有require不需要迭代
        if (match) {
            var i, matchLen = match.length;
            //检查所有require都缓存了
            for (i = 0; i < matchLen; i++) {
                // 检查到没有缓存的就跳出执行后面的缓存
                if (!modules[utils.convertID(regx.exec(match[i])[1])]) {
                    break;
                }
                // 所有require依赖都已缓存
                if (i === matchLen) {
                    return;
                }
            }

            content = content.replace(regx, function($0, $1) {
                var p = path.isAbsolute($1) ? $1 : path.join(filebase, $1),
                    id = utils.convertID(p);

                // TODO: 触发
                var wp = path.join(buildPath, p);
                if (!fs.existsSync(wp)) {
                    /*
                    utils.log("error: 找不到文件", p);
                    return;
                    /*/
                    // 默认ext是.js
                    if (fs.existsSync(wp + '.js')) {
                        p += '.js';
                    } else {

                        p = findInModulePackage(buildPath, modulesPath, $1);

                        if (!p) {
                            // 模块库里面也没有
                            throw Error("error: can not find file(找不到文件) " + wp);
                        }
                    }
                    //*/
                }

                if (!modules[id]) {
                    // 处理循环引用
                    modules[id] = 1;
                    utils.log("dependence(处理依赖): ", p);
                    requireIterator(buildPath, p, modules, moduleList);
                }

                return 'require("' + utils.convertWintoInux(p) + '")';
            });
        }

        //导出前的处理
        content = fireback(cbAfter, {
            cnt: content,
            fp: filepath
        }).cnt;

        filepath = utils.convertWintoInux(filepath);

        // 格式封装 导出tpl: code.tpl需要的数据
        var curID = utils.convertID(filepath);
        (modules[curID] > 1) || moduleList.push({
            id: curID,
            path: filepath,
            code: content
        });
        modules[curID] = 2;

        return moduleList;
    }

    return requireIterator;
}

exportReqI.cbBefore = cbBefore;
exportReqI.cbAfter = cbAfter;

module.exports = exportReqI;