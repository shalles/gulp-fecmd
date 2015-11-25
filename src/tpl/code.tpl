
    // file "{{ path }}" to module[{{ id }}]
    __G__.__M__["{{ id }}"] = {
        path: "{{ path }}",
        fn: function(require, exports, module, undefined) {
            
            {{ code }}
            
        }
    };
