var namespace = require("can-namespace");
var proxyNamespace = require("./src/proxy-namespace");
var temporarilyBind = require("./src/temporarily-bind");

var drawGraph = require("./src/draw-graph/draw-graph");
var logWhatIChange = require("./src/what-i-change/what-i-change");
var logWhatChangesMe = require("./src/what-changes-me/what-changes-me");
var getWhatIChange = require("./src/get-what-i-change/get-what-i-change");
var getWhatChangesMe = require("./src/get-what-changes-me/get-what-changes-me");

module.exports = namespace.debug = {
	drawGraph: temporarilyBind(drawGraph),
	getWhatIChange: temporarilyBind(getWhatIChange),
	getWhatChangesMe: temporarilyBind(getWhatChangesMe),
	logWhatIChange: temporarilyBind(logWhatIChange),
	logWhatChangesMe: temporarilyBind(logWhatChangesMe)
};

window.can = Proxy != null ? proxyNamespace(namespace) : namespace;
