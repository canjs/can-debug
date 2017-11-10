var QUnit = require("steal-qunit");
var getData = require("./get-data");
var Graph = require("../graph/graph");

QUnit.module("getData");

QUnit.test("works with acyclic graphs", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2
	// 1 -> 3
	g.addArrow(one, two, { kind: "valueDependencies" });
	g.addArrow(one, three, { kind: "valueDependencies" });

	assert.deepEqual(getData(g), {
		node: one,
		twoWay: [],
		mutations: [],
		dependencies: [
			{
				node: two,
				twoWay: [],
				mutations: [],
				dependencies: []
			},
			{
				node: three,
				twoWay: [],
				mutations: [],
				dependencies: []
			}
		]
	});
});

QUnit.test("works with graphs including cycles", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2 <-> 3
	g.addArrow(one, two, { kind: "valueDependencies" });
	g.addArrow(two, three, { kind: "valueDependencies" });
	g.addArrow(three, two, { kind: "mutatedValueDependencies" });

	assert.deepEqual(getData(g), {
		node: one,
		twoWay: [],
		mutations: [],
		dependencies: [
			{
				node: two,
				mutations: [],
				dependencies: [],
				twoWay: [
					{
						node: three,
						twoWay: [],
						mutations: [],
						dependencies: []
					}
				]
			}
		]
	});
});
