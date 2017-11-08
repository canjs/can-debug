var QUnit = require('steal-qunit');
var debug = require('./can-debug');
var canReflect = require('can-reflect');

var stache = require('can-stache');
var Scope = require('can-view-scope');
var Observation = require('can-observation');
var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var SimpleObservable = require('can-simple-observable');
var SettableObservable = require('can-simple-observable/settable/settable');
require('can-stache-bindings');

QUnit.module('can-debug');

var noop = function noop() {};

// recursively collect [prop] from the result of calling `debug`
var collectFrom = function(prop, tree) {
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

QUnit.test('works with can-observation', function(assert) {
	var first = new SimpleObservable('John');
	var last = new SimpleObservable('Doe');

	var fullName = new Observation(function() {
		Observation.add(first);
		Observation.add(last);
		return first.get() + ' ' + last.get();
	});
	fullName.start();

	assert.expect(1);
	assert.deepEqual(debug.getDebugData(fullName), {
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

QUnit.test('works with can-define-map', function(assert) {
	var Person = DefineMap.extend({
		first: 'string',
		last: 'string',
		job: 'string',
		fullName: {
			get: function() {
				return this.first + ' ' + this.last;
			}
		},
		ocupation: {
			get: function() {
				return this.fullName + ' - ' + this.job;
			}
		}
	});

	var me = new Person({ first: 'John', last: 'Doe' });
	me.on('ocupation', noop);

	var keys = collectFrom('key', debug.getDebugData(me, 'ocupation'));
	assert.deepEqual(
		keys.filter(function(key) { return Boolean(key); }),
		['ocupation', 'job', 'first', 'last'],
		'gets all key dependencies from the given property'
	);
});

QUnit.test('works with can-simple-observable/settable', function(assert) {
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
	assert.deepEqual(debug.getDebugData(obs), {
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

QUnit.test('works with can-view-scope/compute-data', function(assert) {
	var Person = DefineMap.extend('Person', {
		first: 'string',
		last: 'string',
		fullName: {
			get: function() {
				return this.first + ' ' + this.last;
			}
		}
	});

	var map = new Person({ first: 'John', last: 'Doe' });
	var scope = new Scope(map);
	var computeData = scope.computeData('fullName');
	computeData.compute.bind('change', noop);

	assert.expect(2);

	var data = debug.getDebugData(computeData);
	assert.ok(data.twoWay.length, 'has two way dependencies');

	var twoWayDep = {
		name: data.twoWay[0].node.name,
		key: data.twoWay[0].node.key
	};
	assert.deepEqual(
		twoWayDep,
		{ name: 'Person{}', key: 'fullName' },
		'the compute_data has a two way dep with the PersonVM'
	);
});

QUnit.test('works with can-stache lookup expressions', function(assert) {
	var ViewModel = DefineMap.extend('PersonVM', {
		first: 'string',
		last: 'string',
		fullName: {
			get: function() {
				return this.first + ' ' + this.last;
			}
		}
	});

	var view = stache('<h1 class="full-name">{{fullName}}</h1>');
	var viewModel = new ViewModel({ first: 'Jane', last: 'Doe' });
	document.body.appendChild(view(viewModel));

	var fullNameNode = document.querySelector('.full-name');
	var data = debug.getDebugData(fullNameNode);

	assert.expect(1);
	assert.ok(data.mutations.length, 'DOM element should have mutation dependencies');
	fullNameNode.remove();
});

QUnit.test('works with can-stache attrs', function(assert) {
	var ViewModel = DefineMap.extend('ViewModel', {
		className: 'string'
	});

	var view = stache('<div id="attr" class="{{className}}"></div>');
	var viewModel = new ViewModel({ className: 'container' });
	document.body.appendChild(view(viewModel));

	var divNode = document.querySelector('#attr');
	var data = debug.getDebugData(divNode);

	assert.expect(1);
	assert.ok(data.mutations.length, 'DOM element should have mutation dependencies');
	divNode.remove();
});

QUnit.test('works with can-stache lists', function(assert) {
	var ViewModel = DefineMap.extend('ViewModel', {
		todos: DefineList
	});

	var viewModel = new ViewModel({ todos: ['foo', 'bar', 'baz', 'qux'] });
	var view = stache('<ul class="list">{{#each todos}}<li>{{.}}</li>{{/each}}</ul>');
	document.body.appendChild(view(viewModel));

	var listNode = document.querySelector('.list');
	var data = debug.getDebugData(listNode);

	assert.expect(1);
	assert.ok(data.mutations.length, 'DOM element should have mutation dependencies');
	listNode.remove();
});

QUnit.test('works with can-stache bindings', function(assert) {
	var ViewModel = DefineMap.extend('PersonVM', {
		first: 'string',
		last: 'string',
		fullName: {
			get: function() {
				return this.first + ' ' + this.last;
			}
		}
	});

	var tpl = [
		'<h1 id="full">{{fullName}}</h1>',
		'<input id="first" value:bind="first">',
		'<input id="last" value:bind="last">'
	];

	var view = stache(tpl.join(''));
	var viewModel = new ViewModel({ first: 'Jane', last: 'Doe' });
	document.body.appendChild(view(viewModel));

	var fullNameEl = document.querySelector('#full');
	var firstNameEl = document.querySelector('#first');
	var lastNameEl = document.querySelector('#last');

	var graph = debug.getDirectedGraph(fullNameEl);
	var firstNameNode = graph.findNode(function(node) {
		return node.obj === firstNameEl;
	});
	var lastNameNode = graph.findNode(function(node) {
		return node.obj === lastNameEl;
	});

	assert.expect(2);
	assert.ok(firstNameNode, 'first name input should be in dependency graph');
	assert.ok(lastNameNode, 'last name input should be in dependency graph');
	fullNameEl.remove();
	firstNameEl.remove();
	lastNameEl.remove();
});

QUnit.module('logWhatChangesMe');

QUnit.test('it works', function(assert) {
	var Person = DefineMap.extend('Person', {
		first: 'string',
		last: 'string',
		job: 'string',
		fullName: {
			get: function() {
				return this.first + ' ' + this.last;
			}
		},
		ocupation: {
			get: function() {
				return this.fullName + ' - ' + this.job;
			}
		}
	});

	var me = new Person({ first: 'John', last: 'Doe' });
	me.on('ocupation', function() {});

	var groups = [];
	var consoleGroup = console.group;
	console.group = function(label) {
		groups.push(label);
		consoleGroup.apply(console, arguments);
	};

	assert.expect(1);
	debug.logWhatChangesMe(me, 'ocupation');
	try {
		assert.deepEqual(
			groups.filter(function(g) { return g !== 'DEPENDENCIES'; }),
			[
				'Person{}.ocupation',
				'Observation<Person{}\'s ocupation getter>',
				'Person{}.job',
				'Observation<Person{}\'s fullName getter>',
				'Person{}.first',
				'Person{}.last'
			],
			'logs key/value dependencies of the given property'
		);
	} catch(e) {
		// restore original function
		console.group = consoleGroup;
		assert.ok(false, e);
	}
});
