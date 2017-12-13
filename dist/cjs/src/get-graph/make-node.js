/*can-debug@1.0.0-pre.4#src/get-graph/make-node*/
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