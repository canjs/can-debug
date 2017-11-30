var debug = require("can-debug/can-debug");
var DefineMap = require("can-define/map/map");
var draw = require("can-debug/graph-visualization/draw");

var Person = DefineMap.extend({
	first: "string",
	last: "string",
	job: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	},
	ocupation: {
		get: function() {
			return this.fullName + " - " + this.job;
		}
	}
});

var me = new Person({ first: "John", last: "Doe" });
me.on("ocupation", function() {});

debug.logWhatChangesMe(me, "ocupation");
draw(
	document.querySelector("#container"),
	debug.getGraph(me, "ocupation")
);
