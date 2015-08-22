
    // file "{{ path }}" to module[{{ id }}]
    ___CONTEXT___.___MODULES___["{{ id }}"] = {
        path: "{{ path }}",
        fn: function(require, exports, module, window, undefined) {
            
            {{ code }}
            
        }
    };

