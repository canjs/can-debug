/*can-debug@1.0.0-pre.1#src/what-changes-me/what-changes-me*/
define([
    'require',
    'exports',
    'module',
    '../get-data/get-data',
    '../log-data/log-data',
    '../get-graph/get-graph'
], function (require, exports, module) {
    var getData = require('../get-data/get-data');
    var logData = require('../log-data/log-data');
    var getGraph = require('../get-graph/get-graph');
    module.exports = function logWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        var graph = gotKey ? getGraph(obj, key) : getGraph(obj);
        logData(getData(graph, 'whatChangesMe'));
    };
});