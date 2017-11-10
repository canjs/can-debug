// Returns a deeply nested object from the graph
module.exports = function getDebugData(graph) {
	var visited = new Map();

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
