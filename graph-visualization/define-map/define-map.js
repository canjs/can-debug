var DefineMap = require("can-define/map/map");
var draw = require("can-debug/src/draw-graph/draw-graph");

var Person = DefineMap.extend("Person", {
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

draw(me, "ocupation");
