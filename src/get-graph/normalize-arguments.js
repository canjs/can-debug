var isObject = require("./is-object");

module.exports = function normalizeArguments(obj, key, options) {
	var result = { obj: obj };
	var defaultOptions = { withCycles: true };

	switch (arguments.length) {
		case 1:
			result.options = defaultOptions;
			break;

		case 2:
			if (isObject(key)) {
				result.options = key;
			} else {
				result.options = defaultOptions;
				result.key = key;
			}
			break;

		case 3:
			result.key = key;
			result.options = options;
			break;

		default:
			throw new Error("Incorrect number of arguments " + arguments.length);
	}

	return result;
};
