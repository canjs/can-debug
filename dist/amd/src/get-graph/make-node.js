/*can-debug@1.1.0#src/get-graph/make-node*/
define([
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    module.exports = function makeNode(obj, key) {
        var gotKey = arguments.length === 2;
        var node = {
            obj: obj,
            name: canReflect.getName(obj),
            value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
        };
        if (gotKey) {
            node.key = key;
        }
        return node;
    };
});