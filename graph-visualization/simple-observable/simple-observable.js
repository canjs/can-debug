var canReflect = require("can-reflect");
var Observation = require("can-observation");
var SimpleObservable = require("can-simple-observable");
var draw = require("can-debug/src/draw-graph/draw-graph");

var a = new SimpleObservable("a");
var b = new SimpleObservable("b");

var obs = new Observation(function() {
	return a.get() + b.get();
});

canReflect.onValue(obs, function() {});
draw(obs);
