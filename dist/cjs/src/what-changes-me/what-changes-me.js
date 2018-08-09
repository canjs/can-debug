/*can-debug@2.0.0#src/what-changes-me/what-changes-me*/
'use strict';
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