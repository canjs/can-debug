var debug = require("can-debug/can-debug");
var DefineMap = require("can-define/map/map");
var draw = require("can-debug/graph-visualization/draw");

var Person = DefineMap.extend("Person", {
	first: "string",
	last: "string",
	job: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
});

var me = new Person({ first: "John", last: "Doe" });
me.on("fullName", function() {});
me.on("first", function() {});

console.log(
	debug.getDebugData(debug.getGraph(me, "fullName"), "whatChangesMe")
);
