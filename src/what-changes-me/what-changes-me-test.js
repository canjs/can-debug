var QUnit = require("steal-qunit");
var logWhatChangesMe = require("./what-changes-me");

var DefineMap = require("can-define/map/map");

QUnit.module("logWhatChangesMe");

QUnit.test("it works", function(assert) {
	var Person = DefineMap.extend("Person", {
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
	me.on("ocupation", function() {});

	var groups = [];
	var consoleGroup = console.group;
	console.group = function(label) {
		groups.push(label);
		consoleGroup.apply(console, arguments);
	};

	assert.expect(1);
	logWhatChangesMe(me, "ocupation");
	try {
		assert.deepEqual(
			groups.filter(function(g) {
				return g !== "DEPENDENCIES";
			}),
			[
				"Person{}.ocupation",
				"Observation<Person{}'s ocupation getter>",
				"Person{}.job",
				"Observation<Person{}'s fullName getter>",
				"Person{}.first",
				"Person{}.last"
			],
			"logs key/value dependencies of the given property"
		);
		console.group = consoleGroup;
	} catch (e) {
		console.group = consoleGroup;
		assert.ok(false, e);
	}
});
