var QUnit = require("steal-qunit");
var getData = require("./get-data");
var getGraph = require("../get-graph/get-graph");

var stache = require("can-stache");
var Scope = require("can-view-scope");
var canReflect = require("can-reflect");
var Observation = require("can-observation");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var SimpleObservable = require("can-simple-observable");
var SettableObservable = require("can-simple-observable/settable/settable");

QUnit.module("getData");

// to use when setting up bindings
function noop() {}

// recursively collect [prop] from the result of calling `debug`
var collectFrom = function collectFrom(prop, tree) {
	var result = [];

	var collect = function collect(tree) {
		result.push(tree.node[prop]);
		tree.twoWay.forEach(collect);
		tree.mutations.forEach(collect);
		tree.dependencies.forEach(collect);
	};

	collect(tree);
	return result;
};

QUnit.test("works with can-observation", function(assert) {
	var first = new SimpleObservable("John");
	var last = new SimpleObservable("Doe");

	var fullName = new Observation(function() {
		Observation.add(first);
		Observation.add(last);
		return first.get() + " " + last.get();
	});
	fullName.start();

	assert.expect(1);
	assert.deepEqual(getData(getGraph(fullName, { withCycles: false })), {
		node: {
			order: 1,
			obj: fullName,
			name: "Observation<>",
			value: "John Doe"
		},
		twoWay: [],
		mutations: [],
		dependencies: [
			{
				node: {
					order: 2,
					obj: first,
					value: "John",
					name: 'SimpleObservable<"John">'
				},
				twoWay: [],
				mutations: [],
				dependencies: []
			},
			{
				node: {
					order: 3,
					obj: last,
					value: "Doe",
					name: 'SimpleObservable<"Doe">'
				},
				twoWay: [],
				mutations: [],
				dependencies: []
			}
		]
	});
});

QUnit.test("works with can-define-map", function(assert) {
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
	me.on("ocupation", noop);

	var keys = collectFrom(
		"key",
		getData(getGraph(me, "ocupation", { withCycles: false }))
	);
	assert.deepEqual(
		keys.filter(function(key) {
			return Boolean(key);
		}),
		["ocupation", "job", "first", "last"],
		"gets all key dependencies from the given property"
	);
});

QUnit.test("works with can-simple-observable/settable", function(assert) {
	var value = new SimpleObservable(2);

	var obs = new SettableObservable(
		function(lastSet) {
			return lastSet * value.get();
		},
		null,
		1
	);

	canReflect.onValue(obs, noop);

	assert.expect(1);
	assert.deepEqual(getData(getGraph(obs, { withCycles: false })), {
		node: {
			order: 1,
			obj: obs,
			name: "SettableObservable<>",
			value: 2
		},
		twoWay: [],
		mutations: [],
		dependencies: [
			{
				node: {
					order: 2,
					obj: obs.lastSetValue,
					name: "SimpleObservable<1>",
					value: 1
				},
				twoWay: [],
				mutations: [],
				dependencies: []
			},
			{
				node: {
					order: 3,
					obj: value,
					name: "SimpleObservable<2>",
					value: 2
				},
				twoWay: [],
				mutations: [],
				dependencies: []
			}
		]
	});
});

QUnit.test("works with can-view-scope/compute-data", function(assert) {
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
	computeData.compute.bind("change", noop);

	assert.expect(2);

	var data = getData(getGraph(computeData, { withCycles: false }));
	assert.ok(data.twoWay.length, "has two way dependencies");

	var twoWayDep = {
		name: data.twoWay[0].node.name,
		key: data.twoWay[0].node.key
	};
	assert.deepEqual(
		twoWayDep,
		{ name: "Person{}", key: "fullName" },
		"the compute_data has a two way dep with the PersonVM"
	);
});

QUnit.test("works with can-stache lookup expressions", function(assert) {
	var ViewModel = DefineMap.extend("PersonVM", {
		first: "string",
		last: "string",
		fullName: {
			get: function() {
				return this.first + " " + this.last;
			}
		}
	});

	var view = stache('<h1 class="full-name">{{fullName}}</h1>');
	var viewModel = new ViewModel({ first: "Jane", last: "Doe" });
	document.body.appendChild(view(viewModel));

	var fullNameNode = document.querySelector(".full-name");
	var data = getData(getGraph(fullNameNode, { withCycles: false }));

	assert.expect(1);
	assert.ok(
		data.mutations.length,
		"DOM element should have mutation dependencies"
	);
	fullNameNode.remove();
});

QUnit.test("works with can-stache attrs", function(assert) {
	var ViewModel = DefineMap.extend("ViewModel", {
		className: "string"
	});

	var view = stache('<div id="attr" class="{{className}}"></div>');
	var viewModel = new ViewModel({ className: "container" });
	document.body.appendChild(view(viewModel));

	var divNode = document.querySelector("#attr");
	var data = getData(getGraph(divNode, { withCycles: false }));

	assert.expect(1);
	assert.ok(
		data.mutations.length,
		"DOM element should have mutation dependencies"
	);
	divNode.remove();
});

QUnit.test("works with can-stache lists", function(assert) {
	var ViewModel = DefineMap.extend("ViewModel", {
		todos: DefineList
	});

	var viewModel = new ViewModel({ todos: ["foo", "bar", "baz", "qux"] });
	var view = stache(
		'<ul class="list">{{#each todos}}<li>{{.}}</li>{{/each}}</ul>'
	);
	document.body.appendChild(view(viewModel));

	var listNode = document.querySelector(".list");
	var data = getData(getGraph(listNode, { withCycles: false }));

	assert.expect(1);
	assert.ok(
		data.mutations.length,
		"DOM element should have mutation dependencies"
	);
	listNode.remove();
});
