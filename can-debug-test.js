var QUnit = require('steal-qunit');
var debug = require('./can-debug');
var Scope = require('can-view-scope');
var canReflect = require('can-reflect');
var Observation = require('can-observation');
var DefineMap = require('can-define/map/map');
var SimpleObservable = require('can-simple-observable');
var SettableObservable = require('can-simple-observable/settable/settable');

QUnit.module('can-debug');

var noop = function noop() {};

// recursively collect [prop] from the result of calling `debug`
var collectFrom = function(prop, tree) {
	var result = [];

	var collect = function collect(tree) {
		result.push(tree[prop]);
		for (var key in tree.keyDependencies) {
			collect(tree.keyDependencies[key]);
		}
		tree.valueDependencies.forEach(function(data) {
			collect(data);
		});
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
	assert.deepEqual(debug(fullName), {
		key: undefined,
		obj: fullName,
		name: 'Observation<>',
		value: 'John Doe',
		keyDependencies: {},
		valueDependencies: [{
			key: undefined,
			obj: first,
			value: 'John',
			keyDependencies: {},
			valueDependencies: [],
			name: 'SimpleObservable<"John">',
		}, {
			key: undefined,
			obj: last,
			value: 'Doe',
			keyDependencies: {},
			valueDependencies: [],
			name: 'SimpleObservable<"Doe">',
		}]
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

	var keys = collectFrom('key', debug(me, 'ocupation'));
	assert.deepEqual(
		keys.filter(function(key) { return Boolean(key); }),
		['ocupation', 'job', 'first', 'last'],
		'gets all key dependencies from the given property'
	);
});

QUnit.test('works with can-simple-observable/settable', function(assert) {
	var value = new SimpleObservable(2);

	var obs = new SettableObservable(function(lastSet) {
		return lastSet * value.get();
	}, null, 1);

	canReflect.onValue(obs, noop);

	assert.expect(1);
	assert.deepEqual(debug(obs), {
		key: undefined,
		obj: obs,
		name: 'SettableObservable<>',
		value: 2,
		keyDependencies: {},
		valueDependencies: [{
			key: undefined,
			obj: obs.lastSetValue,
			name: 'SimpleObservable<1>',
			value: 1,
			keyDependencies: {},
			valueDependencies: []
		}, {
			key: undefined,
			obj: value,
			name: 'SimpleObservable<2>',
			value: 2,
			keyDependencies: {},
			valueDependencies: []
		}]
	});
});

QUnit.skip('works with can-view-scope/compute-data', function(assert) {
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

	assert.expect(1);
	assert.deepEqual(collectFrom('name', debug(computeData)), [
		'ScopeKeyData{{fullName}}',
		'Observation<{{fullName}}::ScopeKeyData.read>',
		'Observation<Person{}\'s fullName getter>',
		'Person{}', // first
		'Person{}'  // last
	]);
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
			groups,
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
