@module {Object} can-debug
@parent can-observables
@collection can-ecosystem
@alias can.debug

@description Useful debugging utilities.

@type {Object}

`can-debug` provides methods that show how different parts of an application
affect each other, specifically CanJS's observables and DOM nodes.

Exports an object with the following methods:

```js
{
	getGraph         // Get the observable dependency graph
	getDebugData     // Get the observable dependencies as a deeply nested object
	logWhatIChange   // Log what the observable changes
	logWhatChangesMe // Log what changes the observable
}
```

@body

## Use

`can-debug` exports functions to log how observables affect each other. These 
functions can be used to understand the flow of data throughout an application.

The following example shows how to use the `debug.logWhatChangesMe` to log what 
changes the value of the `fullName` property on the `Person` instance.

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

// The observable must be bound for `logWhatChangesMe` to work correctly.
me.on("fullName", function() {});

debug.logWhatChangesMe(me, "fullName");
```

Which will print out the following message to the browser's console:

![logWhatChangesMe full output](../node_modules/can-debug/doc/what-changes-me-full.png)

At first, the output might be very confusing, specially so in larger examples where
multiple observables are involved. Let's break the output up in smaller sections to get 
a better understanding of what each means:

![logWhatChangesMe output](../node_modules/can-debug/doc/what-changes-me-top.png)

Each observable will be contained in a console group, this group is labeled
using a human-readable name that describes the observeable (blue border box), in 
most cases this name is made out of the constructor name decorated with some metadata. 

Inside the group, the following properties are printed out:

	- value: The current observable's value (red border box)
	- object: The observable object reference (red border box)
	- &#x25B6; DEPENDENCIES: The observable dependencies (green border box)

The properties in the red border box will be printed out for each observable in
the dependency graph. The box with the green border contains subgroups, each of 
these subgroups recursively prints out observables using the same pattern that we 
just described (name, value/reference and its own dependencies grouped).

The subgroup label indicates how these observables relate to the observable that 
contains them, in its current version `can-debug` uses the following labels when 
they apply: 

	- DEPENDENCIES: observables used internally by the parent to compute its value.
	- MUTATION DEPENDENCIES: observables that affect the value of the parent within a specific context.
	- TWO WAY DEPENDENCIES: observables cross bound to their parent

Let's inspect the `Person{}.fullName`'s dependencies group:

![logWhatChangesMe dependencies](../node_modules/can-debug/doc/what-changes-me-deps.png)

We found the same pattern describe for the outer observable:

	- The observable's human-readable name in the blue border box,
	- The observable's value and object reference in the red border box,
	- And finally the observable's own dependencies in the green border box.

The whole output can be read as:

`Person{}.fullName` derives its value from `Observation<Person{}'s fullName getter>`,
which in turn derive its value from `Person{}.first` and `Person{}.last` values.

**NOTE**: Please note that some of the observables printed out in the console do not 
necessarily match the ones found in application code, as mentioned before, observables 
used internally are listed as dependencies, such is the case of `Observation<Person{}'s fullName getter>` 
in the example.

Click the "logWhatChangesMe" button in the demo below and inspect the output in 
the browser's console tab.

@demo demos/can-debug/log-what-changes-map.html

Understading the relationships between types is helpful to debug certain kind of 
issues, but most of the time you want to understand what affects DOM nodes rendering.

The following example shows how to use `debug.logWhatChangesMe` to log what 
changes the `<h1>` element bound to the `fullName` property.

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

var template = stache(`
	<h1 id="full">{{fullName}}</h1>
	<input id="first" value:bind="first">
	<input id="last" value:bind="last">
`);

var scope = new Person({ first: "Jane", last: "Doe" });
document.body.appendChild(template(scope));

debug.logWhatChangeMe(document.querySelect("#full"));
```

This prints out the following message:

![logWhatChangesMe dependencies](../node_modules/can-debug/doc/what-changes-me-input.png)

That's a long message! but once you have identified the outpattern pattern we
discussed before, make sense of it is a lot easier. The observables highlighted
in blue border boxes are the most important to get a high level overview of the
dependency graph, while the observables in between help you make sense of how data
flows from the top `<h1>` element down to the `<input>` bound to the `first` property
and back up to the `<h1>` heading element.

Click the "logWhatChangesMe" button in the demo below and inspect the output in
the browser's console tab:

@demo demos/can-debug/log-what-changes-heading.html

`can-debug` also exports some low level utilities to allow users manipulate and
explore the dependency graph:

	- `debug.getGraph` returns a directed graph data structure, and 
	- `debug.getDebugData` takes a dependendency graph and returns 
		a deeply nested data structure.

The `graph-visualization` folder in `can-debug` includes examples of how 
`debug.getGraph` can be used to draw the dependency graph using a visualization
library.

## How to write can-debug friendly code

CanJS's internal observables are decorated with metadata and symbols used by
`can-debug` to build the dependency graph. 

For most CanJS applications, the default instrumentation should be enough
to get reliable logs from `can-debug`; but custom observable types require some 
extra work to make them easier to debug.

The whole process can be sumarized in the following steps:

	- Give the observable a human-readable name
	- Register what changes the observable
	- Register what the observable changes

### Give the observable a human-readable name

The `@@@can.getName` symbol is used to provide human readable names for each
observable in the dependency graph, this name is used by the default logger to
label the groups containing the observable dependency data.

The main goal of these names is help users get a glance of what the observable 
does and what it is used for, there are no hard rules to create these names but
CanJS uses the following convention for consistent names across its observable types.

	a) The name starts with the observable constructor name
	b) The constructor name is decorated with the following chars based on its type:
		- `<>`: for value-like observables, e.g: `SimpleObservable<>`
		- `[]`: for list-like observables, e.g: `DefineList[]` 
		- `{}`: for map-like observables, e.g: `DefineMap{}`
	c) Any property that makes the instance unique (like ids) are printed inside 
		the chars mentioned before.

The example below shows how to implement `@@@can.getName`, in a value-like 
observable (similar to `can-simple-observable`).

```js
var canReflect = require("can-reflect");

function MySimpleObservable(value) {
	this.value = value;
}

canReflect.assignSymbols(MySimpleObservable.prototype, {
	// The special comments tell Steal.js to remove the code during the build.
	"can.getName": function() {
		//!steal-remove-start
		var value = JSON.stringify(this.value);
		return canReflect.getName(this.constructor) + "<" + value + ">";
		//!steal-remove-end
	}
});
```

With that in place, `MySimpleObservable` can be used like:

```js
var one = new MySimpleObservable(1);
canReflect.getName(one); // MySimpleObservable<1>
```

### Register what changes the observable

If the custom observable derives its value from other observables internally,
the following symbols must be implemented:

	- `@@@can.getKeyDependencies`: The key dependencies of the observable
	- `@@@can.getValueDependencies`: The value dependencies of the observable	

E.g:

```js
var canSymbol = require("can-symbol");
var observation = require("can-observation");

function MyCustomObservable(value) {
	this.observation = new Observation(...);
}

MyCustomObservable.prototype.get = function() {
	return this.observation.get();
};
```

`MyCustomObservable` uses an `Observation` instance internally to derive its value,
since `Observation` is a value-like observable, `MyCustomObservable` has to implement
`@@@can.getValueDependencies` so this relationship is visible to `can-debug`.

```js
function MyCustomObservable() { ... }

...

canReflect.assignSymbols(MyCustomObservable, {
	"can.getValueDependencies": function() {
		return {
			valueDependencies: new Set([ this.observation ])
		};
	}
});
```

It's possible that a specific instance of `MyCustomObservable` gets mutated by
another observable in a specific context, this kind of dependecies won't be registered
by the symbols we discussed before and they are really important to get a sense
of how data flows through different parts of the application.

In order to keep track of these dependencies, `can-reflect-dependencies` must 
be used:

```js
var someMap = new SomeMap();
var myObservable = new MyCustomObservable();
var canReflectDeps = require("can-reflect-dependencies");

// when the foo property changes, update myObservable
someMap.on("foo", function() {
	myObservable.set(/* some value */);
});

// this registers that `myObservable` is mutated by the `foo` property of `someMap`
canReflectDeps.addMutatedBy(myObservable, {
	keyDependencies: new Map([ [someMap, new Set(["foo"])] ]);
});
```

### Register the observable changes

In the previous section, `can-reflect-dependencies` was used to register that
`someMap.foo` changes `myObservable`; In its current form `can-reflect-dependencies` 
can only "see" the dependency from `myObservable`, that means:

```js
// this works!
canReflectDeps.getDependencyDataOf(myObservable);

// but this does not, it returns `undefined` :(
canReflectDeps.getDependencyDataOf(someMap, "foo");
```

In order to register the dependency in the opossite direction, the following things
need to happen:

	- `SomeMap` has to implement the `@@@can.getWhatIChange` symbol
	- Event handlers attached to `SomeMap` instances need to implement the 
		`@@@can.getChangesDependencyRecord` symbol to be used by `@@@can.getWhatIChange`.

CanJS observables make this easier by attaching event handling capabilities through
[can-event-queue](https://github.com/canjs/can-event-queue) mixins, adding in the
[value mixin](https://github.com/canjs/can-event-queue/blob/master/value/value.js) to
`SomeMap`'s prototype will add a base implementation of `@@@can.getWhatIChange` which
iterates over the registered handlers and calls `@@@can.getChangesDependencyRecord` on
each.

Having `@@@can.getWhatIChange` implemented by `can-event-queue`, the next thing 
to do is to implement `@@@can.getChangesDependencyRecord` on the event handler
that mutates `myObservable`. 

```js
/* code omitted for brevity */

// Bind the callback to a variable to make adding the symbol easier
var onFooChange = function() {
	myObservable.set(/* some value */);
};

canReflect.assignSymbols(onFooChange, {
	"can.getChangesDependencyRecord": function() {
		return {
			valueDependencies: new Set([ myObservable ])
		};
	}
});

someMap.on("foo", onFooChange);
```

With this in place the following code should work now:

```js
canReflectDeps.getDependencyDataOf(someMap, "foo"); // ... myObservable
```

**NOTE**: This implementation requires `can-event-queue/value/value` mixin to be
added to `SomeMap`'s prototype, if your observable uses custom event handling logic
you need to implement `@@@can.getWhatIChange` and keep track of what the event handlers
are mutating manually.
