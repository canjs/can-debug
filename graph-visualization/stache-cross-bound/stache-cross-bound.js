var debug = require("can-debug/can-debug");
var draw = require("can-debug/graph-visualization/draw");

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

var view = stache(`
	<h1 id="full">{{fullName}}</h1>
	<input id="first" value:bind="first">
	<input id="last" value:bind="last">
`);

var scope = new Person({ first: "Jane", last: "Doe" });

document.querySelector("#slot").appendChild(view(scope));
debug.logWhatChangesMe(document.querySelector("#full"));
draw(
	document.querySelector("#container"),
	debug.getGraph(document.querySelector("#full"))
);
