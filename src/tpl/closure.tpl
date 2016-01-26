// file "{{ path }}" to window["{{ id }}"]
(function(exports, module, window, undefined) {
    
    {{ code }}

    window.__MODULES["{{id}}"] = module.exports || exports;
})({}, {}, window);

