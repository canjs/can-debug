var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var getGraph = require("./get-graph");
var mutateDeps = require("can-reflect-mutate-dependencies");
var getValueDependenciesSymbol = canSymbol.for("can.getValueDependencies");

QUnit.module("getGraph");

QUnit.test("works with acyclic dependencies", function(assert) {
	var obs = {};
	var obs2 = {};
	var obs3 = {};

	obs[getValueDependenciesSymbol] = function() {
		return {
			valueDependencies: new Set([ obs2 ])
		};
	};

	obs2[getValueDependenciesSymbol] = function() {
		return {
			keyDependencies: new Map([
				[obs3, new Set(["fullName"])]
			])
		};
	};

	var order = 0;
	var head = null;
	var expected = [
		{ obj: obs },
		{ obj: obs2, kind: "valueDependencies" },
		{ obj: obs3, kind: "keyDependencies" }
	];

	var graph = getGraph(obs);

	graph.dfs(function(node) {
		assert.equal(node.obj, expected[order].obj);

		if (head) {
			var meta = graph.getArrowMeta(head, node);
			assert.equal(expected[order].kind, meta.kind);
		}

		head = node;
		order += 1;
	});
});

QUnit.test("works with two way dependencies", function(assert) {
	var obs = {};
	var obs2 = {};
	var obs3 = {};

	obs[getValueDependenciesSymbol] = function() {
		return {
			valueDependencies: new Set([ obs2 ])
		};
	};

	obs2[getValueDependenciesSymbol] = function() {
		return {
			keyDependencies: new Map([
				[obs3, new Set(["fullName"])]
			])
		};
	};

	mutateDeps.addMutatedBy(obs3, "fullName", obs);

	var order = 0;
	var head = null;
	var expected = [
		{ obj: obs },
		{ obj: obs2, kind: "valueDependencies" },
		{ obj: obs3, kind: "keyDependencies" },
		{ obj: obs, kind: "mutatedValueDependencies" }
	];

	var graph = getGraph(obs);

	graph.dfs(function(node) {
		assert.equal(node.obj, expected[order].obj);

		if (head) {
			var meta = graph.getArrowMeta(head, node);
			assert.equal(expected[order].kind, meta.kind);
		}

		head = node;
		order += 1;
	});
});
