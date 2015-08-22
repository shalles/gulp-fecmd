;(function(___CONTEXT___){
    if (!___CONTEXT___.___MODULES___) {
        ___CONTEXT___.___MODULES___ = {};
    };
    function convertToID(path){
        return path.replace(/[^a-zA-Z0-9]/g, "");
    }
    function require(path){
        var module = ___CONTEXT___.___MODULES___[convertToID(path)];
        if(!module){ console.log("导出文件有问题"); return;}
        if(module.fn && !module.exports){
            module.exports = {};
            module.fn(require, module.exports, module, window);
            delete module.fn;
        }
        return module.exports;
    }
