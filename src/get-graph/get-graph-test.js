var QUnit = require("steal-qunit");
var getGraph = require("./get-graph");
var normalizeArguments = require("./normalize-arguments");

var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
require("can-stache-bindings");

QUnit.module("normalizeArguments");

QUnit.test("with no arguments", function(assert) {
	assert.throws(function() {
		normalizeArguments();
	}, /Incorrect number of arguments/);
});

QUnit.test("with 1 argument", function(assert) {
	var obj = {};
	var args = normalizeArguments(obj);

	assert.ok(!("key" in args), "key was not passed in");
	assert.equal(args.obj, obj);
	assert.ok(args.options.withCycles, "default option should be returned");
});

QUnit.test("with 2 arguments but no options", function(assert) {
	var obj = {};
	var key = "fullName";
	var args = normalizeArguments(obj, key);

	assert.equal(args.key, key);
	assert.equal(args.obj, obj);
	assert.ok(args.options.withCycles, "default option should be returned");
});

QUnit.test("with 2 arguments but no key", function(assert) {
	var obj = {};
	var options = { withCycles: false };
	var args = normalizeArguments(obj, options);

	assert.equal(args.obj, obj);
	assert.equal(args.options, options);
	assert.ok(!("key" in args), "key was not passed in");
});

QUnit.test("with 3 arguments", function(assert) {
	var obj = {};
	var key = "fullName";
	var options = { withCycles: false };
	var args = normalizeArguments(obj, key, options);

	assert.equal(args.obj, obj);
	assert.equal(args.key, key);
	assert.equal(args.options, options);
});

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
