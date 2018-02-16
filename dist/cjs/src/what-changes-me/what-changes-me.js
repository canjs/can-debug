/*can-debug@1.0.0#src/what-changes-me/what-changes-me*/
var log = require('../log-data/log-data.js');
var getData = require('../get-data/get-data.js');
var getGraph = require('../get-graph/get-graph.js');
module.exports = function logWhatChangesMe(obj, key) {
    var gotKey = arguments.length === 2;
    var data = getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatChangesMe');
    if (data) {
        log(data);
    }
};