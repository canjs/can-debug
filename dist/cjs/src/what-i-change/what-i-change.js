/*can-debug@1.0.0-pre.2#src/what-i-change/what-i-change*/
var log = require('../log-data/log-data.js');
var getData = require('../get-data/get-data.js');
var getGraph = require('../get-graph/get-graph.js');
module.exports = function logWhatIChange(obj, key) {
    var gotKey = arguments.length === 2;
    var data = getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatIChange');
    if (data) {
        log(data);
    }
};