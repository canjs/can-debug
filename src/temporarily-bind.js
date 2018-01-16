var canReflect = require("can-reflect");

// Takes a function with signature `fn(obj, [key])`
// Makes sure that the argument is bound before calling 
// the function and unbinds it after the call is done.
module.exports = function temporarilyBind(fn) {
	return function(obj, key) {
		var noop = function noop() {};
		var gotKey = arguments.length === 2;
		var result;

		if (gotKey) {
			canReflect.onKeyValue(obj, key, noop);
			result = fn(obj, key);
			canReflect.offKeyValue(obj, key, noop);
		} else {
			canReflect.onValue(obj, noop);
			result = fn(obj);
			canReflect.offValue(obj, noop);
		}

		return result;
	};
};
