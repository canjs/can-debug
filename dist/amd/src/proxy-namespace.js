/*can-debug@1.0.0#src/proxy-namespace*/
define(function (require, exports, module) {
    (function (global, require, exports, module) {
        var warned = false;
        module.exports = function proxyNamespace(namespace) {
            return new Proxy(namespace, {
                get: function get(target, name) {
                    if (!warned) {
                        console.warn('Warning: use of \'can\' global should be for debugging purposes only.');
                        warned = true;
                    }
                    return target[name];
                }
            });
        };
    }(function () {
        return this;
    }(), require, exports, module));
});