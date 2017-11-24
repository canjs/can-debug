/*can-debug@1.0.0-pre.1#src/what-i-change/what-i-change*/
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
    module.exports = function logWhatIChange(obj, key) {
        var gotKey = arguments.length === 2;
        var graph = gotKey ? getGraph(obj, key) : getGraph(obj);
        logData(getData(graph, 'whatIChange'));
    };
});