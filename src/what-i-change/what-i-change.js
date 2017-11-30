var log = require("../log-data/log-data");
var getData = require("../get-data/get-data");
var getGraph = require("../get-graph/get-graph");

// key :: string | number | null | undefined
module.exports = function logWhatIChange(obj, key) {
	var gotKey = arguments.length === 2;

	var data = getData(
		gotKey ? getGraph(obj, key) : getGraph(obj),
		"whatIChange"
	);

	if (data) {
		log(data);
	}
};
