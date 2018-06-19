var QUnit = require("steal-qunit");
var debug = require("can-debug");
var DefineMap = require("can-define/map/map");
var testHelpers = require("can-test-helpers");
var clone = require("steal-clone");

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

testHelpers.dev.devOnlyTest("calls window.__CANJS_DEVTOOLS__.register if available", function(assert) {
	var done = assert.async();

	var devtools = window.__CANJS_DEVTOOLS__ = window.__CANJS_DEVTOOLS__ || {};

	var origRegister = devtools.register;
	devtools.register = function(can) {
		assert.equal(can, window.can, "window.can was passed to register");
	};

	clone({})
	.import("can-debug")
	.then(function() {
		devtools.register = origRegister;
		done();
	});
});
