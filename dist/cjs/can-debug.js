/*can-debug@1.0.0-pre.0#can-debug*/
var namespace = require('can-namespace');
var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');
var getKeyDependenciesSymbol = canSymbol.for('can.getKeyDependencies');
var getValueDependenciesSymbol = canSymbol.for('can.getValueDependencies');
function debug(obj, key) {
    var gotKey = arguments.length === 2;
    var data = {
        obj: obj,
        key: key,
        keyDependencies: {},
        valueDependencies: [],
        name: canReflect.getName(obj),
        value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
    };
    var deps = gotKey ? getKeyDependencies(obj, key) : getValueDependencies(obj);
    if (!deps) {
        return data;
    }
    if (deps.keyDependencies) {
        canReflect.each(deps.keyDependencies, function (value, obj) {
            canReflect.each(value, function (key) {
                data.keyDependencies[key] = debug(obj, key);
            });
        });
    }
    if (deps.valueDependencies) {
        canReflect.each(deps.valueDependencies, function (obj) {
            data.valueDependencies.push(debug(obj));
        });
    }
    return data;
}
debug.logWhatChangesMe = function (obj, key) {
    var gotKey = arguments.length === 2;
    var quoteString = function (x) {
        return typeof x === 'string' ? JSON.stringify(x) : x;
    };
    var log = function log(data) {
        var nameParts = [
            data.name,
            data.key != null ? '.' + data.key : ''
        ];
        console.group(nameParts.join(''));
        console.log('value  ', quoteString(data.value));
        console.log('object ', data.obj);
        canReflect.each(data.keyDependencies, log);
        canReflect.each(data.valueDependencies, log);
        console.groupEnd();
    };
    return gotKey ? log(debug(obj, key)) : log(debug(obj));
};
function getKeyDependencies(obj, key) {
    if (obj[getKeyDependenciesSymbol]) {
        return canReflect.getKeyDependencies(obj, key);
    }
}
function getValueDependencies(obj) {
    if (obj[getValueDependenciesSymbol]) {
        return canReflect.getValueDependencies(obj);
    }
}
module.exports = namespace.debug = debug;