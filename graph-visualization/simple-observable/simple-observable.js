var debug = require("can-debug");
var Observation = require("can-observation");
var SimpleObservable = require("can-simple-observable");

var a = new SimpleObservable("a");
var b = new SimpleObservable("b");

var obs = new Observation(function() {
	return a.get() + b.get();
});

debug.drawGraph(obs);
