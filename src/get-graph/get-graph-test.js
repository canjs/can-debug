var QUnit = require("steal-qunit");
var getGraph = require("./get-graph");

var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
require("can-stache-bindings");

QUnit.module("getGraph");

QUnit.test("works with can-stache bindings", function(assert) {
	var ViewModel = DefineMap.extend("PersonVM", {
		first: "string",
		last: "string",
		fullName: {
			get: function() {
				return this.first + " " + this.last;
			}
		}
	});

	var tpl = [
		'<h1 id="full">{{fullName}}</h1>',
		'<input id="first" value:bind="first">',
		'<input id="last" value:bind="last">'
	];

	var view = stache(tpl.join(""));
	var viewModel = new ViewModel({ first: "Jane", last: "Doe" });
	document.body.appendChild(view(viewModel));

	var fullNameEl = document.querySelector("#full");
	var firstNameEl = document.querySelector("#first");
	var lastNameEl = document.querySelector("#last");

	var graph = getGraph(fullNameEl);
	var firstNameNode = graph.findNode(function(node) {
		return node.obj === firstNameEl;
	});
	var lastNameNode = graph.findNode(function(node) {
		return node.obj === lastNameEl;
	});

	assert.expect(2);
	assert.ok(firstNameNode, "first name input should be in dependency graph");
	assert.ok(lastNameNode, "last name input should be in dependency graph");
	fullNameEl.remove();
	firstNameEl.remove();
	lastNameEl.remove();
});
