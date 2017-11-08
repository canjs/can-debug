var debug = require("can-debug/can-debug");
var draw = require("can-debug/graph-visualization/draw");

var canReflect = require("can-reflect");
var Observation = require("can-observation");
var SimpleObservable = require("can-simple-observable");

var a = new SimpleObservable("a");
var b = new SimpleObservable("b");

var obs = new Observation(function() {
	return a.get() + b.get();
});

canReflect.onValue(obs, function() {});
draw(
	document.querySelector("#container"),
	debug.getGraph(obs)
);
