@function can-debug.logWhatChangesMe logWhatChangesMe
@parent can-debug

@description Log what changes an observable.

@signature `debug.logWhatChangesMe(observable, [key])`

Logs what changes the observable. If a `key` is provided, logs what changes the 
`key` of the observable.

```js
var Person = DefineMap.extend("Person", {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
});

var me = new Person({ first: "John", last: "Doe" });
me.on("fullName", function() {});

debug.logWhatChangesMe(me, "fullName");
```

Logs

![logWhatChangesMe full output](../node_modules/can-debug/doc/what-changes-me-full.png)

@param {Object} observable An observable.
@param {Any} [key] The key of a property on a map-like observable.
