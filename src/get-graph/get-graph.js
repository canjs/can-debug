var Graph = require("../graph/graph");
var makeNode = require("./make-node");
var canReflect = require("can-reflect");
var mutateDeps = require("can-reflect-mutate-dependencies");

// Returns a directed graph of the dependencies of obj (key is optional)
//
// Signature:
//	getDirectedGraph(obj)
//	getDirectedGraph(obj, key)
module.exports = function getGraph(obj, key) {
	var order = 0;
	var graph = new Graph();
	var gotKey = arguments.length === 2;

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
			if (meta.head) {
				graph.addArrow(meta.head, node, { kind: meta.kind });
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

	return gotKey ? visit(obj, key, {}) : visit(obj);
};
