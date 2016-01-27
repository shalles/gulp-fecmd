var fs = require('fs'),
    path = require('path'),
    utils = require('./utils.js');
    babel = require('babel-core');


/*
 * callback(parmas)
 * args.cnt  当前处理文件的内容 string
 * args.fp   当前处理文件的绝对路径 string
 *
 * 
 */
module.exports = function(cbBefore, cbAfter, buildPath, exportType, retract){
    // 清空 clear callback
    cbBefore.empty();
    cbAfter.empty();

    var exportTpl = utils.loadTpl(__dirname + '/tpl/' + 
            (exportType === 'window' ? 'exp-func' : 'export') + '.tpl');
    
    var retractStr = '\n';
    for(var i = 0; i < retract; i++){
        retractStr += '\t';
    }
    //格式缩进 format require code tab
    cbAfter.add(function(args){
        args.cnt = args.cnt.replace(/\n/g, retractStr);
        return;
    });
    // 处理不同ext文件 template require like require('htmlcode.tpl') export a safe string;
    cbBefore.add(function(args){
        switch(path.extname(args.fp)){
            case '.tpl': 
                args.cnt = utils.simpleTemplate(exportTpl, JSON.stringify(args.cnt));
                break;
            case '.json':
                args.cnt = utils.simpleTemplate(exportTpl, args.cnt); //解析出错直接暴露
                break;
            case '.es6':
                args.cnt = babel.transform(args.cnt, {
                    modules: "common" 
                }).code;
                break;
            default:
                break;
        }
        return;
    })
}
