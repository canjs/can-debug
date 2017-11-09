var namespace = require('can-namespace');

var getData = require('./src/get-data/get-data');
var getGraph = require('./src/get-graph/get-graph');
var logWhatChangesMe = require('./src/what-changes-me/what-changes-me');

module.exports = namespace.debug = {
	getDirectedGraph: getGraph,
	getDebugData: getData,
	logWhatChangesMe: logWhatChangesMe
};
