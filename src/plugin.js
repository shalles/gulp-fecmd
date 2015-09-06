var fs = require('fs'),
    path = require('path'),
    babel = require('babel-core');

/*
 * callback(parmas)
 * args.cnt  当前处理文件的内容 string
 * args.fp   当前处理文件的绝对路径 string
 *
 * 
 */
module.exports = function(cbBefore, cbAfter, buildPath){
    // 清空 clear callback
    cbBefore.empty();
    cbAfter.empty();
    
    //格式缩进 format require code tab
    cbAfter.add(function(args){
        args.cnt = args.cnt.replace(/\n/g, '\n\t\t\t');
        return;
    });
    // 处理不同ext文件 template require like require('htmlcode.tpl') export a safe string;
    cbBefore.add(function(args){
        switch(path.extname(args.fp)){
            case '.tpl': 
                args.cnt = "module.exports=" + JSON.stringify(args.cnt);
                break;
            case '.json':
                args.cnt = "module.exports=" + args.cnt; //解析出错直接暴露
                break;
            case '.es6':
                // var result = traceur.compile(args.cnt, {
                //     sourceMap: false,
                //     // 其他设置
                //     modules: 'commonjs'
                // });
                // if(result.error) throw result.error;
                // console.log(result)
                // args.cnt = result;

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
