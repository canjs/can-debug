var namespace = require('can-namespace');
var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');

var getKeyDependenciesSymbol = canSymbol.for('can.getKeyDependencies');
var getValueDependenciesSymbol = canSymbol.for('can.getValueDependencies');

function debug(obj, key) {
	// key can be 0, maybe undefined
	var gotKey = arguments.length === 2;

	var data = {
		obj: obj,
		key: key,
		keyDependencies: {},
		valueDependencies: [],
		name: canReflect.getName(obj),
		value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
	};

	var deps = gotKey ? getKeyDependencies(obj, key) : getValueDependencies(obj);
	if (!deps) {
		return data;
	}

	// deps.keyDependencies :: Map
	if (deps.keyDependencies) {
		canReflect.each(deps.keyDependencies, function(value, obj) {
			canReflect.each(value, function(key) {
				data.keyDependencies[key] = debug(obj, key);
			});
		});
	}

	// deps.valueDependencies :: Set
	if (deps.valueDependencies) {
		canReflect.each(deps.valueDependencies, function(obj) {
			data.valueDependencies.push(debug(obj));
		});
	}

	return data;
}

debug.logWhatChangesMe = function(obj, key) {
	var quoteString = function(x) {
		return typeof x === 'string' ? JSON.stringify(x) : x;
	};

	var log = function log(data) {
		var nameParts = [data.name, data.key != null ? ('.' + data.key) : ''];

		console.group(nameParts.join(''));
		console.log('value  ', quoteString(data.value));
		console.log('object ', data.obj);
		canReflect.each(data.keyDependencies, log);
		canReflect.each(data.valueDependencies, log);
		console.groupEnd();
	};

	log(debug(obj, key));
};

function getKeyDependencies(obj, key) {
	if (obj[getKeyDependenciesSymbol]) {
		return canReflect.getKeyDependencies(obj, key);
	}
}

function getValueDependencies(obj) {
	if (obj[getValueDependenciesSymbol]) {
		return canReflect.getValueDependencies(obj);
	}
}

module.exports = namespace.debug = debug;
