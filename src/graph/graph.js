function Graph() {
	this.nodes = [];
	this.arrows = new Map();
	this.arrowsMeta = new Map();
}

// Adds the node, but it does not check if the node exists, callers will have
// to check that through [findNode]
Graph.prototype.addNode = function addNode(node) {
	this.nodes.push(node);
	this.arrows.set(node, new Set());
};

// Adds an arrow from head to tail with optional metadata
// The method does not check whether head and tail are already
// nodes in the graph, this should be done by the caller.
Graph.prototype.addArrow = function addArrow(head, tail, meta) {
	var graph = this;

	graph.arrows.get(head).add(tail);

	// optional
	if (meta) {
		addArrowMeta(graph, head, tail, meta);
	}
};

// Tests whether there is an arrow from head to tail
Graph.prototype.hasArrow = function hasArrow(head, tail) {
	return this.getNeighbors(head).has(tail);
};

// Returns the metadata associated to the head -> tail arrow
Graph.prototype.getArrowMeta = function getArrowMeta(head, tail) {
	return this.arrowsMeta.get(head).get(tail);
};

// Sets metadata about the arrow from head to tail
// Merges the passed object into existing metadata
Graph.prototype.setArrowMeta = function setArrowMeta(head, tail, meta) {
	addArrowMeta(this, head, tail, meta);
};

// Returns a Set of all nodes 'y' such that there is an arrow
// from the node 'x' to the node 'y'.
Graph.prototype.getNeighbors = function getNeighbors(node) {
	return this.arrows.get(node);
};

// Returns the first node that satisfies the provided testing function.
// The Graph is traversed using depth first search
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
	var visited = new Map([[node, true]]);

	while (queue.length) {
		node = queue.shift();

		visit(node);

		graph.arrows.get(node).forEach(function(adj) {
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
			graph.arrows.get(node).forEach(function(adj) {
				stack.push(adj);
			});
		}
	}
};

// Returns a new graph with all the arrows not involved in a circuit
// Calls `cb` when a back edge is found so the caller can choose what
// do to with it
Graph.prototype.labelCycles = function labelCycles(cb) {
	var visited = new Map();

	var graph = this;
	var result = new Graph();

	// copy over all nodes
	graph.nodes.forEach(function(node) {
		result.addNode(node);
	});

	var visit = function visit(node) {
		visited.set(node, true);

		graph.arrows.get(node).forEach(function(adj) {
			// back edge found
			if (visited.has(adj)) {
				cb(result, node, adj);
			} else {
				// copy over the arrow from node to adj
				result.addArrow(node, adj);

				// copy over the path metadata
				var arrowMeta = graph.arrowsMeta.get(node).get(adj);
				addArrowMeta(result, node, adj, arrowMeta);

				visit(adj);
			}
		});
	};

	graph.nodes.forEach(function(node) {
		if (!visited.has(node)) {
			visit(node);
		}
	});

	return result;
};

// Helpers
function addArrowMeta(graph, head, tail, meta) {
	var entry = graph.arrowsMeta.get(head);

	if (entry) {
		var arrowMeta = entry.get(tail);
		if (!arrowMeta) {
			arrowMeta = {};
		}
		entry.set(tail, Object.assign(arrowMeta, meta));
	} else {
		entry = new Map([[tail, meta]]);
		graph.arrowsMeta.set(head, entry);
	}
}

module.exports = Graph;
