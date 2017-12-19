var draw = require("can-debug/graph-visualization/draw");
var getGraph = require("can-debug/src/get-graph/get-graph");

var Scope = require("can-view-scope");
var DefineMap = require("can-define/map/map");
var mutateDeps = require("can-reflect-dependencies");

var Person = DefineMap.extend("Person", {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
});

var map = new Person({ first: "John", last: "Doe" });
var scope = new Scope(map);
var computeData = scope.computeData("fullName");
computeData.compute.bind("change", function() {});

console.log(mutateDeps.getDependencyDataOf(computeData));
draw(
	document.querySelector("#container"),
	getGraph(computeData)
);
