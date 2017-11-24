var log = require("./log-data");
var QUnit = require("steal-qunit");

QUnit.module("log-data");

QUnit.test("it works", function(assert) {
	var data = {
		node: { obj: {}, name: "PersonVM", key: "fullName", value: "John Doe" },
		twoWay: [],
		mutations: [],
		dependencies: [
			{
				node: { obj: {}, name: "PersonVM", key: "first", value: "John" },
				twoWay: [],
				mutations: [],
				dependencies: []
			},
			{
				node: { obj: {}, name: "PersonVM", key: "last", value: "John" },
				twoWay: [],
				mutations: [],
				dependencies: []
			}
		]
	};

	var groups = new Set();
	var consoleGroup = console.group;
	console.group = function(label) {
		groups.add(label);
		consoleGroup.apply(console, arguments);
	};
	log(data);

	// groups dependencies by "kind"
	assert.ok(groups.has("DEPENDENCIES"));
	assert.ok(!groups.has("MUTATION DEPENDENCIES"), "no empty groups");
	assert.ok(!groups.has("TWO WAY DEPENDENCIES"), "no empty groups");

	// creates groups for each dependency
	assert.ok(groups.has("PersonVM.fullName"));
	assert.ok(groups.has("PersonVM.first"));
	assert.ok(groups.has("PersonVM.last"));
});
