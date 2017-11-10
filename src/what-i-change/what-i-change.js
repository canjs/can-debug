var getData = require("../get-data/get-data");
var logData = require("../log-data/log-data");
var getGraph = require("../get-graph/get-graph");

module.exports = function logWhatIChange(obj, key) {
	// key :: string | number | null | undefined
	var gotKey = arguments.length === 2;

	var graph = gotKey ?
		getGraph(obj, key, { withCycles: false }) :
		getGraph(obj, { withCycles: false });

	logData(getData(graph.reverse()));
};
