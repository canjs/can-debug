var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
var draw = require("can-debug/src/draw-graph/draw-graph");

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
draw(document.querySelector("#first"), "value");
