@function can-debug.logWhatIChange logWhatIChange
@parent can-debug

@description Log what an observable changes.

@signature `debug.logWhatIChange(observable, [key])`

Logs what the observable changes. If a `key` is provided, logs what the `key` 
of the observable changes.

```js
var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
require("can-stache-bindings");

var Person = DefineMap.extend("Person", {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
});

var view = stache(`
	<h1 id="full">{{fullName}}</h1>
	<input id="first" value:bind="first">
	<input id="last" value:bind="last">
`);

var scope = new Person({ first: "Jane", last: "Doe" });
document.body.appendChild(view(scope));

debug.logWhatIChange(document.querySelector("#first"), "value");
```

Logs

![logWhatIChange](../node_modules/can-debug/doc/what-i-change.png)

@param {Object} observable An observable.
@param {Any} [key] The key of a property on a map-like observable.
