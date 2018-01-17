var debug = require("can-debug");
var Scope = require("can-view-scope");
var DefineMap = require("can-define/map/map");

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

debug.drawGraph(computeData);
