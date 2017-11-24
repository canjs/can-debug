/*can-debug@1.0.0-pre.1#src/what-changes-me/what-changes-me*/
var getData = require('../get-data/get-data.js');
var logData = require('../log-data/log-data.js');
var getGraph = require('../get-graph/get-graph.js');
module.exports = function logWhatChangesMe(obj, key) {
    var gotKey = arguments.length === 2;
    var graph = gotKey ? getGraph(obj, key) : getGraph(obj);
    logData(getData(graph, 'whatChangesMe'));
};