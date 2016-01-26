
// file "{{ path }}" to module[{{ id }}]
window.["{{id}}"] = (function(exports, module, window, undefined) {
    
    {{ code }}

    return module.exports || exports;
})({}, {}, window);
