var canReflect = require("can-reflect");
var getData = require("../get-data/get-data");

module.exports = function logWhatChangesMe(obj, key) {
	// key :: string | number | null | undefined
	var gotKey = arguments.length === 2;

	var quoteString = function quoteString(x) {
		return typeof x === "string" ? JSON.stringify(x) : x;
	};

	var log = function log(data) {
		var node = data.node;
		var nameParts = [node.name, "key" in node ? "." + node.key : ""];

		console.group(nameParts.join(""));
		console.log("value  ", quoteString(node.value));
		console.log("object ", node.obj);

		if (data.dependencies.length) {
			console.group("DEPENDENCIES");
			canReflect.eachIndex(data.dependencies, log);
			console.groupEnd();
		}

		if (data.mutations.length) {
			console.group("MUTATION DEPENDENCIES");
			canReflect.eachIndex(data.mutations, log);
			console.groupEnd();
		}

		if (data.twoWay.length) {
			console.group("TWO WAY DEPENDENCIES");
			canReflect.eachIndex(data.twoWay, log);
			console.groupEnd();
		}

		console.groupEnd();
	};

	log(gotKey ? getData(obj, key) : getData(obj));
};
