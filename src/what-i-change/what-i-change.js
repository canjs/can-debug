var getData = require("../get-data/get-data");
var logData = require("../log-data/log-data");
var getGraph = require("../get-graph/get-graph");

// key :: string | number | null | undefined
module.exports = function logWhatIChange(obj, key) {
	var gotKey = arguments.length === 2;
	var graph = gotKey ? getGraph(obj, key) : getGraph(obj);

	logData(getData(graph, "whatIChange"));
};
