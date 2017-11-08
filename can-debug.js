var canReflect = require('can-reflect');
var namespace = require('can-namespace');
var Graph = require('can-debug/graph/graph');
var mutateDeps = require('can-reflect-mutate-dependencies');

// wrapper for exported methods
var debug = {};

var isObject = function isObject(value) {
  return value != null && typeof value === 'object';
};

function makeNode(obj, key) {
	var gotKey = arguments.length === 2;

	var node = {
		obj: obj,
		name: canReflect.getName(obj),
		value: gotKey ?
			canReflect.getKeyValue(obj, key) :
			canReflect.getValue(obj)
	};

	if (gotKey) {
		node.key = key;
	}

	return node;
}

var normalizeMakeGraphArguments = function normalize(obj, key, options) {
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
			throw new Error('Incorrect number of arguments ' + arguments.length);
	}

	return result;
};

// Signature:
//	getDirectedGraph(obj)
//	getDirectedGraph(obj, key)
//	getDirectedGraph(obj, options)
//	getDirectedGraph(ob, key, options)
debug.getDirectedGraph = function makeDirectedGraph(obj, key, options) {
	var order = 0;
	var graph = new Graph();

	var args = normalizeMakeGraphArguments.apply(null, arguments);
	options = args.options;
	var withCycles = options.withCycles == null ? true : options.withCycles;

	function visit(obj, key, meta) {
		// key can be 0, an empty string, maybe undefined.
		var gotKey = arguments.length === 3;

		// if this method is called with 2 arguments it will
		// assume [head] was passed in instead of [key]
		if (typeof meta === 'undefined' && arguments.length !== 1) {
			meta = key;
			key = undefined;
		}

		// make sure [meta] is always an object
		meta = meta == null ? {} : meta;

		var node = graph.findNode(function(node) {
			return gotKey ?
				node.obj === obj && node.key === key :
				node.obj === obj;
		});

		if (node) {
			// back edge found
			if (meta.head) {
				if (withCycles) {
					graph.addArrow(meta.head, node, { kind: meta.kind });
				} else {
					var isTwoWay = graph.arrows.get(node).has(meta.head);

					// if isTwoWay is false it means the cycle involves more than 2 nodes,
					// e.g: A -> B -> C -> A
					// what to do in these cases? (currently ignoring these)
					if (isTwoWay) {
						graph.arrowsMeta.get(node).get(meta.head).kind = 'twoWayDependencies';
					}
				}
			}
			// prevent infinite recursion
			return graph;
		} else {
			order += 1;

			node = gotKey ? makeNode(obj, key) : makeNode(obj);
			node.order = order;

			graph.addNode(node);
			if (meta.head) {
				graph.addArrow(meta.head, node, {
					kind: meta.kind
				});
			}
		}

		var deps = gotKey ?
			mutateDeps.getKeyDependencies(obj, key) :
			mutateDeps.getValueDependencies(obj);

		// also return if there is nothing to visit
		if (!deps) {
			return graph;
		}

		// keyDependencies :: Map<obj, Set<key>>
		var visitKeyDeps = function visitKeyDependencies(source, prop) {
			canReflect.each(source[prop], function(value, obj) {
				canReflect.each(value, function(key) {
					visit(obj, key, { head: node, kind: prop });
				});
			});
		};

		// valueDependencies :: Set<obj>
		var visitValueDeps = function visitValueDependencies(source, prop) {
			canReflect.each(source[prop], function(obj) {
				visit(obj, { head: node, kind: prop });
			});
		};

		if (deps.keyDependencies) {
			visitKeyDeps(deps, 'keyDependencies');
		}

		if (deps.mutatedKeyDependencies) {
			visitKeyDeps(deps, 'mutatedKeyDependencies');
		}

		if (deps.valueDependencies) {
			visitValueDeps(deps, 'valueDependencies');
		}

		if (deps.mutatedValueDependencies) {
			visitValueDeps(deps, 'mutatedValueDependencies');
		}

		return graph;
	}

	return ('key' in args) ? visit(obj, key, {}) : visit(obj);
};

debug.getDebugData = function getDebugData(obj, key) {
	var visited = new Map();
	var gotKey = arguments.length === 2;

	var graph = gotKey ?
		debug.getDirectedGraph(obj, key, { withCycles: false }) :
		debug.getDirectedGraph(obj, { withCycles: false });

	var visit = function visit(node) {
		var data = { node: node, dependencies: [], mutations: [], twoWay: [] };

		graph.arrows.get(node).forEach(function(adj) {
			var meta = graph.arrowsMeta.get(node).get(adj);

			if (!visited.has(adj) && meta) {
				visited.set(adj, true);

				switch (meta.kind) {
					case 'twoWayDependencies':
						data.twoWay.push(visit(adj));
						break;

					case 'keyDependencies' :
					case 'valueDependencies':
						data.dependencies.push(visit(adj));
						break;

					case 'mutatedKeyDependencies':
					case 'mutatedValueDependencies':
						data.mutations.push(visit(adj));
						break;
				}
			}
		});

		return data;
	};

	return visit(graph.nodes[0]);
};

debug.logWhatChangesMe = function logWhatChangesMe(obj, key) {
	// key can be 0, an empty string, maybe undefined.
	var gotKey = arguments.length === 2;

	var quoteString = function quoteString(x) {
		return typeof x === 'string' ? JSON.stringify(x) : x;
	};

	var log = function log(data) {
		var node = data.node;
		var nameParts = [node.name, 'key' in node ? ('.' + node.key) : ''];

		console.group(nameParts.join(''));
		console.log('value  ', quoteString(node.value));
		console.log('object ', node.obj);

		if (data.dependencies.length) {
			console.group('DEPENDENCIES');
			canReflect.each(data.dependencies, log);
			console.groupEnd();
		}

		if (data.mutations.length) {
			console.group('MUTATION DEPENDENCIES');
			canReflect.each(data.mutations, log);
			console.groupEnd();
		}

		if (data.twoWay.length) {
			console.group('TWO WAY DEPENDENCIES');
			canReflect.each(data.twoWay, log);
			console.groupEnd();
		}

		console.groupEnd();
	};

	var data = gotKey ? debug.getDebugData(obj, key) : debug.getDebugData(obj);
	log(data);
};

module.exports = namespace.debug = debug;
