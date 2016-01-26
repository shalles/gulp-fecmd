// file "{{ path }}" to module[{{ id }}]
window.{{id}} = (function(exports, module, undefined) {
    
    {{ code }}

    return module.exports || exports;
})({}, {});