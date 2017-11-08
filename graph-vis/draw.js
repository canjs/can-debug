var vis = require('vis');
var canReflect = require('can-reflect');

module.exports = function draw(container, graph) {
	// creates a Map where the node is the key and a numeric id the value
	var nodeIdMap = new Map(graph.nodes.map(function(node, index) {
		return [node, index + 1];
	}));

	// collects nodes in the shape of { id: Number, label: String }
	var nodesDataSet = graph.nodes.map(function(node) {
		return {
			id: nodeIdMap.get(node),
			label: canReflect.getName(node.obj) +
			(node.key ? '.' + node.key : '') + " " + node.order
		};
	});

	var getArrowData = function getArrowData(kind) {
		var regular = { arrows: 'to' };
		var twoWay = { arrows: 'to, from' };
		var withDashes = { arrows: 'to', dashes: true };

		var map = {
			keyDependencies: regular,
			valueDependencies: regular,
			twoWayDependencies: twoWay,
			mutatedKeyDependencies: withDashes,
			mutatedValueDependencies: withDashes,
		};

		return map[kind];
	};

	// collect edges in the shape of { from: Id, to: Id }
	var visited = new Map();
	var arrowsDataSet = [];
	graph.nodes.forEach(function(node) {
		var visit = function(node) {
			if (!visited.has(node)) {
				visited.set(node, true);
				var arrows = graph.arrows.get(node);
				var headId = nodeIdMap.get(node);

				arrows.forEach(function(neighbor) {
					var tailId = nodeIdMap.get(neighbor);
					var meta = graph.arrowsMeta.get(node).get(neighbor);

					arrowsDataSet.push(Object.assign(
						{ from: headId, to: tailId },
						getArrowData(meta.kind)
					));

					visit(neighbor);
				});
			}
		};

		visit(node);
	});

	var data = {
		nodes: new vis.DataSet(nodesDataSet),
		edges: new vis.DataSet(arrowsDataSet)
	};

	var options = {
		width: (window.innerWidth - 25) + 'px',
		height: (window.innerHeight - 75) + 'px',
		physics: {
			solver: 'repulsion'
		}
	};

	return new vis.Network(container, data, options);
};
