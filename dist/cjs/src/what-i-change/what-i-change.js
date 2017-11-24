/*can-debug@1.0.0-pre.1#src/what-i-change/what-i-change*/
var getData = require('../get-data/get-data.js');
var logData = require('../log-data/log-data.js');
var getGraph = require('../get-graph/get-graph.js');
module.exports = function logWhatIChange(obj, key) {
    var gotKey = arguments.length === 2;
    var graph = gotKey ? getGraph(obj, key) : getGraph(obj);
    logData(getData(graph, 'whatIChange'));
};