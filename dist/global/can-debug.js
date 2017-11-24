/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		} else if (!args[0] && deps[0] === "exports") {
			// Babel uses the exports and module object.
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{},
	typeof self == "object" && self.Object == Object ? self : window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*can-debug@1.0.0-pre.1#src/graph/graph*/
define('can-debug/src/graph/graph', function (require, exports, module) {
    function Graph() {
        this.nodes = [];
        this.arrows = new Map();
        this.arrowsMeta = new Map();
    }
    Graph.prototype.addNode = function addNode(node) {
        this.nodes.push(node);
        this.arrows.set(node, new Set());
    };
    Graph.prototype.addArrow = function addArrow(head, tail, meta) {
        var graph = this;
        graph.arrows.get(head).add(tail);
        if (meta) {
            addArrowMeta(graph, head, tail, meta);
        }
    };
    Graph.prototype.hasArrow = function hasArrow(head, tail) {
        return this.getNeighbors(head).has(tail);
    };
    Graph.prototype.getArrowMeta = function getArrowMeta(head, tail) {
        return this.arrowsMeta.get(head) && this.arrowsMeta.get(head).get(tail);
    };
    Graph.prototype.setArrowMeta = function setArrowMeta(head, tail, meta) {
        addArrowMeta(this, head, tail, meta);
    };
    Graph.prototype.getNeighbors = function getNeighbors(node) {
        return this.arrows.get(node);
    };
    Graph.prototype.findNode = function findNode(cb) {
        var found = null;
        var graph = this;
        for (var node of graph.nodes) {
            if (cb(node)) {
                found = node;
                break;
            }
        }
        return found;
    };
    Graph.prototype.bfs = function bfs(visit) {
        var graph = this;
        var node = graph.nodes[0];
        var queue = [node];
        var visited = new Map([[
                node,
                true
            ]]);
        while (queue.length) {
            node = queue.shift();
            visit(node);
            graph.arrows.get(node).forEach(function (adj) {
                if (!visited.has(adj)) {
                    queue.push(adj);
                    visited.set(adj, true);
                }
            });
        }
    };
    Graph.prototype.dfs = function dfs(visit) {
        var graph = this;
        var node = graph.nodes[0];
        var stack = [node];
        var visited = new Map();
        while (stack.length) {
            node = stack.pop();
            visit(node);
            if (!visited.has(node)) {
                visited.set(node, true);
                graph.arrows.get(node).forEach(function (adj) {
                    stack.push(adj);
                });
            }
        }
    };
    Graph.prototype.reverse = function reverse() {
        var graph = this;
        var reversed = new Graph();
        graph.nodes.forEach(reversed.addNode.bind(reversed));
        graph.nodes.forEach(function (node) {
            graph.getNeighbors(node).forEach(function (adj) {
                var meta = graph.getArrowMeta(node, adj);
                reversed.addArrow(adj, node, meta);
            });
        });
        return reversed;
    };
    function addArrowMeta(graph, head, tail, meta) {
        var entry = graph.arrowsMeta.get(head);
        if (entry) {
            var arrowMeta = entry.get(tail);
            if (!arrowMeta) {
                arrowMeta = {};
            }
            entry.set(tail, Object.assign(arrowMeta, meta));
        } else {
            entry = new Map([[
                    tail,
                    meta
                ]]);
            graph.arrowsMeta.set(head, entry);
        }
    }
    module.exports = Graph;
});
/*can-debug@1.0.0-pre.1#src/label-cycles/label-cycles*/
define('can-debug/src/label-cycles/label-cycles', [
    'require',
    'exports',
    'module',
    'can-debug/src/graph/graph'
], function (require, exports, module) {
    var Graph = require('can-debug/src/graph/graph');
    module.exports = function labelCycles(graph) {
        var visited = new Map();
        var result = new Graph();
        graph.nodes.forEach(function (node) {
            result.addNode(node);
        });
        var visit = function visit(node) {
            visited.set(node, true);
            graph.getNeighbors(node).forEach(function (adj) {
                if (visited.has(adj)) {
                    var isTwoWay = graph.hasArrow(node, adj);
                    if (isTwoWay) {
                        result.addArrow(adj, node, { kind: 'twoWay' });
                    }
                } else {
                    result.addArrow(node, adj, graph.getArrowMeta(node, adj));
                    visit(adj);
                }
            });
        };
        visit(graph.nodes[0]);
        return result;
    };
});
/*can-debug@1.0.0-pre.1#src/get-data/get-data*/
define('can-debug/src/get-data/get-data', [
    'require',
    'exports',
    'module',
    'can-debug/src/label-cycles/label-cycles'
], function (require, exports, module) {
    var labelCycles = require('can-debug/src/label-cycles/label-cycles');
    var isDisconnected = function isDisconnected(data) {
        return !data.twoWay.length && !data.dependencies.length && !data.mutations.length;
    };
    module.exports = function getDebugData(inputGraph, direction) {
        var visited = new Map();
        var graph = labelCycles(inputGraph);
        var isWantedDirection = function isWantedDirection(meta) {
            return direction == null || direction === meta.direction;
        };
        var visit = function visit(node) {
            var data = {
                node: node,
                dependencies: [],
                mutations: [],
                twoWay: []
            };
            visited.set(node, true);
            graph.getNeighbors(node).forEach(function (adj) {
                var meta = graph.getArrowMeta(node, adj);
                if (!visited.has(adj) && (meta && isWantedDirection(meta))) {
                    switch (meta.kind) {
                    case 'twoWay':
                        data.twoWay.push(visit(adj));
                        break;
                    case 'derive':
                        data.dependencies.push(visit(adj));
                        break;
                    case 'mutate':
                        data.mutations.push(visit(adj));
                        break;
                    default:
                        throw new Error('Unknow meta.kind value: ', meta.kind);
                    }
                }
            });
            return data;
        };
        var result = visit(graph.nodes[0]);
        return isDisconnected(result) ? null : result;
    };
});
/*can-debug@1.0.0-pre.1#src/get-graph/make-node*/
define('can-debug/src/get-graph/make-node', [
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    module.exports = function makeNode(obj, key) {
        var gotKey = arguments.length === 2;
        var node = {
            obj: obj,
            name: canReflect.getName(obj),
            value: gotKey ? canReflect.getKeyValue(obj, key) : canReflect.getValue(obj)
        };
        if (gotKey) {
            node.key = key;
        }
        return node;
    };
});
/*can-debug@1.0.0-pre.1#src/get-graph/get-graph*/
define('can-debug/src/get-graph/get-graph', [
    'require',
    'exports',
    'module',
    'can-debug/src/graph/graph',
    'can-debug/src/get-graph/make-node',
    'can-reflect',
    'can-reflect-dependencies'
], function (require, exports, module) {
    var Graph = require('can-debug/src/graph/graph');
    var makeNode = require('can-debug/src/get-graph/make-node');
    var canReflect = require('can-reflect');
    var mutateDeps = require('can-reflect-dependencies');
    module.exports = function getGraph(obj, key) {
        var order = 0;
        var graph = new Graph();
        var gotKey = arguments.length === 2;
        var addArrow = function addArrow(direction, parent, child, meta) {
            switch (direction) {
            case 'whatIChange':
                graph.addArrow(parent, child, meta);
                break;
            case 'whatChangesMe':
                graph.addArrow(child, parent, meta);
                break;
            default:
                throw new Error('Unknown direction value: ', meta.direction);
            }
        };
        var visitKeyDependencies = function visitKeyDependencies(source, meta, cb) {
            canReflect.eachKey(source.keyDependencies || {}, function (keys, obj) {
                canReflect.each(keys, function (key) {
                    cb(obj, meta, key);
                });
            });
        };
        var visitValueDependencies = function visitValueDependencies(source, meta, cb) {
            canReflect.eachIndex(source.valueDependencies || [], function (obj) {
                cb(obj, meta);
            });
        };
        var visit = function visit(obj, meta, key) {
            var gotKey = arguments.length === 3;
            var node = graph.findNode(function (node) {
                return gotKey ? node.obj === obj && node.key === key : node.obj === obj;
            });
            if (node) {
                if (meta.parent) {
                    addArrow(meta.direction, meta.parent, node, {
                        kind: meta.kind,
                        direction: meta.direction
                    });
                }
                return graph;
            }
            order += 1;
            node = gotKey ? makeNode(obj, key) : makeNode(obj);
            node.order = order;
            graph.addNode(node);
            if (meta.parent) {
                addArrow(meta.direction, meta.parent, node, {
                    kind: meta.kind,
                    direction: meta.direction
                });
            }
            var nextMeta;
            var data = gotKey ? mutateDeps.getDependencyDataOf(obj, key) : mutateDeps.getDependencyDataOf(obj);
            if (data && data.whatIChange) {
                nextMeta = {
                    direction: 'whatIChange',
                    parent: node
                };
                canReflect.eachKey(data.whatIChange, function (dependencyRecord, kind) {
                    nextMeta.kind = kind;
                    visitKeyDependencies(dependencyRecord, nextMeta, visit);
                    visitValueDependencies(dependencyRecord, nextMeta, visit);
                });
            }
            if (data && data.whatChangesMe) {
                nextMeta = {
                    direction: 'whatChangesMe',
                    parent: node
                };
                canReflect.eachKey(data.whatChangesMe, function (dependencyRecord, kind) {
                    nextMeta.kind = kind;
                    visitKeyDependencies(dependencyRecord, nextMeta, visit);
                    visitValueDependencies(dependencyRecord, nextMeta, visit);
                });
            }
            return graph;
        };
        return gotKey ? visit(obj, {}, key) : visit(obj, {});
    };
});
/*can-debug@1.0.0-pre.1#src/log-data/log-data*/
define('can-debug/src/log-data/log-data', [
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    var quoteString = function quoteString(x) {
        return typeof x === 'string' ? JSON.stringify(x) : x;
    };
    module.exports = function log(data) {
        var node = data.node;
        var nameParts = [
            node.name,
            'key' in node ? '.' + node.key : ''
        ];
        console.group(nameParts.join(''));
        console.log('value  ', quoteString(node.value));
        console.log('object ', node.obj);
        if (data.dependencies.length) {
            console.group('DEPENDENCIES');
            canReflect.eachIndex(data.dependencies, log);
            console.groupEnd();
        }
        if (data.mutations.length) {
            console.group('MUTATION DEPENDENCIES');
            canReflect.eachIndex(data.mutations, log);
            console.groupEnd();
        }
        if (data.twoWay.length) {
            console.group('TWO WAY DEPENDENCIES');
            canReflect.eachIndex(data.twoWay, log);
            console.groupEnd();
        }
        console.groupEnd();
    };
});
/*can-debug@1.0.0-pre.1#src/what-i-change/what-i-change*/
define('can-debug/src/what-i-change/what-i-change', [
    'require',
    'exports',
    'module',
    'can-debug/src/get-data/get-data',
    'can-debug/src/log-data/log-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    var getData = require('can-debug/src/get-data/get-data');
    var logData = require('can-debug/src/log-data/log-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function logWhatIChange(obj, key) {
        var gotKey = arguments.length === 2;
        var graph = gotKey ? getGraph(obj, key) : getGraph(obj);
        logData(getData(graph, 'whatIChange'));
    };
});
/*can-debug@1.0.0-pre.1#src/what-changes-me/what-changes-me*/
define('can-debug/src/what-changes-me/what-changes-me', [
    'require',
    'exports',
    'module',
    'can-debug/src/get-data/get-data',
    'can-debug/src/log-data/log-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    var getData = require('can-debug/src/get-data/get-data');
    var logData = require('can-debug/src/log-data/log-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function logWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        var graph = gotKey ? getGraph(obj, key) : getGraph(obj);
        logData(getData(graph, 'whatChangesMe'));
    };
});
/*can-debug@1.0.0-pre.1#can-debug*/
define('can-debug', [
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph',
    'can-debug/src/what-i-change/what-i-change',
    'can-debug/src/what-changes-me/what-changes-me'
], function (require, exports, module) {
    var namespace = require('can-namespace');
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    var logWhatIChange = require('can-debug/src/what-i-change/what-i-change');
    var logWhatChangesMe = require('can-debug/src/what-changes-me/what-changes-me');
    module.exports = namespace.debug = {
        getGraph: getGraph,
        getDebugData: getData,
        logWhatIChange: logWhatIChange,
        logWhatChangesMe: logWhatChangesMe
    };
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : window);