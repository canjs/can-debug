/*can-debug@1.0.0-pre.1#can-debug*/
var namespace = require('can-namespace');
var getData = require('./src/get-data/get-data.js');
var getGraph = require('./src/get-graph/get-graph.js');
var logWhatIChange = require('./src/what-i-change/what-i-change.js');
var logWhatChangesMe = require('./src/what-changes-me/what-changes-me.js');
module.exports = namespace.debug = {
    getGraph: getGraph,
    getDebugData: getData,
    logWhatIChange: logWhatIChange,
    logWhatChangesMe: logWhatChangesMe
};