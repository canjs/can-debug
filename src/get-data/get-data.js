var labelCycles = require("../label-cycles/label-cycles");

// Returns a deeply nested object from the graph
module.exports = function getDebugData(inputGraph) {
	var visited = new Map();
	var graph = labelCycles(inputGraph);

	var visit = function visit(node) {
		var data = { node: node, dependencies: [], mutations: [], twoWay: [] };

		visited.set(node, true);

		graph.getNeighbors(node).forEach(function(adj) {
			var meta = graph.getArrowMeta(node, adj);

			if (!visited.has(adj) && meta) {
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
