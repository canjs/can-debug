var draw = require("can-debug/graph-visualization/draw");
var getGraph = require("can-debug/src/get-graph/get-graph");

var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
require("can-stache-bindings");

var Person = DefineMap.extend("Person", {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
});

var view = stache('<input id="first" value:from="first">');
var scope = new Person({ first: "Jane", last: "Doe" });

document.querySelector("#slot").appendChild(view(scope));
draw(
	document.querySelector("#container"),
	getGraph(document.querySelector("#first"), "value")
);
