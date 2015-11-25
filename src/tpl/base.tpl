;(function(__G__){
    if (!__G__.__M__) {
        __G__.__M__ = {};
    };
    function convertToID(path){
        return path.replace(/[^a-zA-Z0-9]/g, "");
    }
    function require(path){
        var module = __G__.__M__[convertToID(path)];
        if(!module){ console.log("error: 导出文件有问题", path); return;}
        if(module.fn && !module.exports){
            module.exports = {};
            module.fn(require, module.exports, module);
            delete module.fn;
        }
        return module.exports;
    }
    {{ modules }}
    {{ init }}
    
})(this);