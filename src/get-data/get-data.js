var getGraph = require("../get-graph/get-graph");

// Returns a deeply nested object with the dependencies of obj (key?)
module.exports = function getDebugData(obj, key) {
	var visited = new Map();
	var gotKey = arguments.length === 2;

	var graph = gotKey ?
		getGraph(obj, key, { withCycles: false }) :
		getGraph(obj, { withCycles: false });

	var visit = function visit(node) {
		var data = { node: node, dependencies: [], mutations: [], twoWay: [] };

		graph.getNeighbors(node).forEach(function(adj) {
			var meta = graph.getArrowMeta(node, adj);

			if (!visited.has(adj) && meta) {
				visited.set(adj, true);

				switch (meta.kind) {
					case "twoWayDependencies":
						data.twoWay.push(visit(adj));
						break;

					case "keyDependencies":
					case "valueDependencies":
						data.dependencies.push(visit(adj));
						break;

					case "mutatedKeyDependencies":
					case "mutatedValueDependencies":
						data.mutations.push(visit(adj));
						break;
				}
			}
		});

		return data;
	};

	return visit(graph.nodes[0]);
};
