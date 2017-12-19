var QUnit = require("steal-qunit");
var debug = require("can-debug");

QUnit.module("can-debug");

QUnit.test("exports an object", function(assert) {
	assert.equal(typeof debug, "object", "should set global namespace");
	assert.equal(typeof debug.logWhatChangesMe, "function");
	assert.equal(typeof debug.logWhatChangesMe, "function");
});

QUnit.test("sets can global namespace", function(assert) {
	assert.equal(typeof window.can, "object", "should set global namespace");
});

QUnit.test("warns users accessing global namespace once", function(assert) {
	var warn = console.warn;

	assert.expect(1);
	console.warn = function(msg) {
		assert.ok(/for debugging purposes only/.test(msg));
	};

	var d = can.debug;
	d = can.debug;
	d = can.debug;

	console.warn = warn;
});

QUnit.test("sets itself on the global namespace", function(assert) {
	assert.equal(typeof can.debug, "object", "should set itself");
});
