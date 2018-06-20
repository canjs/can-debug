var namespace = require("can-namespace");
var proxyNamespace = require("./src/proxy-namespace");
var temporarilyBind = require("./src/temporarily-bind");

var getGraph = require("./src/get-graph/get-graph");
var formatGraph = require("./src/draw-graph/format-graph");
var drawGraph = require("./src/draw-graph/draw-graph");
var logWhatIChange = require("./src/what-i-change/what-i-change");
var logWhatChangesMe = require("./src/what-changes-me/what-changes-me");
var getWhatIChange = require("./src/get-what-i-change/get-what-i-change");
var getWhatChangesMe = require("./src/get-what-changes-me/get-what-changes-me");

var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var canQueues = require("can-queues");
var mergeDeep = require("can-diff/merge-deep/merge-deep");

module.exports = namespace.debug = {
	getGraph: temporarilyBind(getGraph),
	formatGraph: temporarilyBind(formatGraph),
	drawGraph: temporarilyBind(drawGraph),
	getWhatIChange: temporarilyBind(getWhatIChange),
	getWhatChangesMe: temporarilyBind(getWhatChangesMe),
	logWhatIChange: temporarilyBind(logWhatIChange),
	logWhatChangesMe: temporarilyBind(logWhatChangesMe)
};

window.can = typeof Proxy !== "undefined" ? proxyNamespace(namespace) : namespace;

if (window.__CANJS_DEVTOOLS__) {
	window.__CANJS_DEVTOOLS__.register({
		Symbol: canSymbol,
		Reflect: canReflect,
		queues: canQueues,
		getGraph: namespace.debug.getGraph,
		formatGraph: namespace.debug.formatGraph,
		mergeDeep: mergeDeep
	});
}
