var QUnit = require("steal-qunit");
var debug = require("can-debug");
var DefineMap = require("can-define/map/map");

QUnit.module("can-debug");

QUnit.test("exports an object", function(assert) {
	assert.equal(typeof debug, "object", "should set global namespace");
	assert.equal(typeof debug.logWhatChangesMe, "function");
	assert.equal(typeof debug.logWhatChangesMe, "function");
});

QUnit.test("sets can global namespace", function(assert) {
	assert.equal(typeof window.can, "object", "should set global namespace");
});

QUnit.test("sets itself on the global namespace", function(assert) {
	assert.equal(typeof can.debug, "object", "should set itself");
});

QUnit.test("binds automatically #33", function(assert) {
	var Person = DefineMap.extend("Person", {
		first: "string",
		last: "string",
		fullName: {
			get: function() {
				return this.first + " " + this.last;
			}
		}
	});

	var me = new Person({ first: "Simon", last: "Diaz" });
	var data = debug.getWhatChangesMe(me, "fullName");

	assert.ok(data.derive.length, "should return dependencies");
});

QUnit.test("calls canReflect bind symbols safely", function(assert) {
	assert.ok(debug.getWhatChangesMe({}) === null, "should not throw");
});
