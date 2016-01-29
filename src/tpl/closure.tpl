// file "{{ path }}" to window["{{ id }}"]
(function(module, window, undefined) {
    exports = module.exports = {};

    {{ code }}

    window.__MODULES["{{id}}"] = module.exports;
})({}, window);

