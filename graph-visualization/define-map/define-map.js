var debug = require("can-debug");
var DefineMap = require("can-define/map/map");

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
debug.drawGraph(me, "ocupation");
