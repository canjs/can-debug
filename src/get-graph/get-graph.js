var Graph = require("../graph/graph");
var makeNode = require("./make-node");
var canReflect = require("can-reflect");
var normalizeArguments = require("./normalize-arguments");
var mutateDeps = require("can-reflect-mutate-dependencies");

// Returns a directed graph of the dependencies of obj (key is optional)
//
// Set options.withCycles to false to remove cycles from the graph, it will
// set the arrow meta.kind to 'twoWayDependencies'.
//
// Signature:
//	getDirectedGraph(obj)
//	getDirectedGraph(obj, key)
//	getDirectedGraph(obj, options)
//	getDirectedGraph(ob, key, options)
module.exports = function getGraph(obj, key, options) {
	var order = 0;
	var graph = new Graph();

	var args = normalizeArguments.apply(null, arguments);
	options = args.options;
	var withCycles = options.withCycles == null ? true : options.withCycles;

	function visit(obj, key, meta) {
		// key can be 0, an empty string, maybe undefined.
		var gotKey = arguments.length === 3;

		// if this method is called with 2 arguments it will
		// assume [head] was passed in instead of [key]
		if (typeof meta === "undefined" && arguments.length !== 1) {
			meta = key;
			key = undefined;
		}

		// make sure [meta] is always an object
		meta = meta == null ? {} : meta;

		var node = graph.findNode(function(node) {
			return gotKey ? node.obj === obj && node.key === key : node.obj === obj;
		});

		if (node) {
			// back edge found
			if (meta.head) {
				if (withCycles) {
					graph.addArrow(meta.head, node, { kind: meta.kind });
				} else {
					var isTwoWay = graph.hasArrow(node, meta.head);

					// if isTwoWay is false it means the cycle involves more than 2 nodes,
					// e.g: A -> B -> C -> A
					// what to do in these cases? (currently ignoring these)
					if (isTwoWay) {
						graph.setArrowMeta(node, meta.head, {
							kind: "twoWayDependencies"
						});
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
			canReflect.eachKey(source[prop], function(value, obj) {
				canReflect.each(value, function(key) {
					visit(obj, key, { head: node, kind: prop });
				});
			});
		};

		// valueDependencies :: Set<obj>
		var visitValueDeps = function visitValueDependencies(source, prop) {
			canReflect.eachIndex(source[prop], function(obj) {
				visit(obj, { head: node, kind: prop });
			});
		};

		if (deps.keyDependencies) {
			visitKeyDeps(deps, "keyDependencies");
		}

		if (deps.mutatedKeyDependencies) {
			visitKeyDeps(deps, "mutatedKeyDependencies");
		}

		if (deps.valueDependencies) {
			visitValueDeps(deps, "valueDependencies");
		}

		if (deps.mutatedValueDependencies) {
			visitValueDeps(deps, "mutatedValueDependencies");
		}

		return graph;
	}

	return "key" in args ? visit(obj, key, {}) : visit(obj);
};
