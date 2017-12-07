@function can-debug.logWhatIChange logWhatIChange
@parent can-debug

@description Log what an observable affects.

@signature `debug.logWhatIChange(observable, [key])`

Logs what the observable affects If a `key` is provided, logs what the `key` 
of the observable affects.

The following example is similar to the one shown in [logWhatChangesMe], but 
instead of checking out what affects the `Person` instance itself, it renders a
template where the `Person` instance is passed as the scope object.

The template renders two `<input>` elements bound to `first` and `last` respectively,
and prints out the `fullName` value in a `<h1>` element. Then it calls `logWhatIChange`
passing the `<input>` element reference with id "first".

```js
var debug = require("can-debug");
var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
require("can-stache-bindings");

var Person = DefineMap.extend("Person", {
	first: "string",
	last: "string",
	fullName: {
		get() {
			return `${this.first} ${this.last}`;
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

It logs the observables affected by the `value` attribute of the `<input>`
element as shown below:

![logWhatIChange](../node_modules/can-debug/doc/what-i-change.png)

@param {Object} observable An observable.
@param {Any} [key] The key of a property on a map-like observable.