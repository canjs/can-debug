var QUnit = require("steal-qunit");
var getData = require("./get-data");
var Graph = require("../graph/graph");

QUnit.module("getData");

QUnit.test("works with acyclic graphs (whatIChange)", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2
	// 1 -> 3
	g.addArrow(one, two, { kind: "derive", direction: "whatIChange" });
	g.addArrow(one, three, { kind: "derive", direction: "whatIChange" });

	assert.deepEqual(getData(g, "whatIChange"), {
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

QUnit.test("works with acyclic graphs (whatChangesMe)", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2
	// 1 -> 3
	g.addArrow(one, two, { kind: "derive", direction: "whatIChange" });
	g.addArrow(one, three, { kind: "derive", direction: "whatIChange" });

	assert.ok(
		getData(g, "whatChangesMe") == null,
		"there are no arrows in the indicated direction"
	);
});

QUnit.test("works with acyclic graphs (any direction)", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2
	// 1 -> 3
	g.addArrow(one, two, { kind: "derive", direction: "whatIChange" });
	g.addArrow(one, three, { kind: "derive", direction: "whatIChange" });

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
	g.addArrow(one, two, { kind: "derive" });
	g.addArrow(two, three, { kind: "derive" });
	g.addArrow(three, two, { kind: "mutate" });

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
