/*can-debug@1.0.0-pre.1#src/get-data/get-data*/
var labelCycles = require('../label-cycles/label-cycles.js');
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