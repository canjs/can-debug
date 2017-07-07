/*can-debug@0.0.0#can-debug*/
define(function (require, exports, module) {
    var namespace = require('can-namespace');
    var canSymbol = require('can-symbol');
    var canReflect = require('can-reflect');
    var getValueDependenciesSymbol = canSymbol.for('can.getValueDependencies');
    function debug(obj) {
        var debugData = {
            cid: obj._cid,
            obj: obj,
            value: canReflect.getValue(obj),
            valueDependencies: [],
            keyDependencies: {}
        };
        if (obj[getValueDependenciesSymbol]) {
            var deps = canReflect.getValueDependencies(obj) || {};
            if (deps.valueDependencies) {
                deps.valueDependencies.forEach(function (valueDep) {
                    debugData.valueDependencies.push(debug(valueDep));
                });
            }
            if (deps.keyDependencies) {
                deps.keyDependencies.forEach(function (events, key) {
                    debugData.keyDependencies[events.join(',')] = debug(key);
                });
            }
        }
        return debugData;
    }
    module.exports = namespace.debug = debug;
});