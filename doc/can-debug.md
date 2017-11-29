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

Each observable will be contained in a console group, this group will be labeled
using a pretty name (blue border box), in most cases the constructor name decorated 
with some metadata. Inside the group, the following properties are printed out:

	- value: The current observable's value (red border box)
	- object: The observable object reference (red border box)
	- &#x25B6; DEPENDENCIES: The observable dependencies (green border box)

The properties in the red border box will be printed out for each observable in
the dependency graph. The box with the green border contains subgroups, each of 
these subgroups lists observables using the same pattern that we just described.

The subgroup label indicates how these observables relate to the observable they are 
contained within, in its current version, `can-debug` prints out the following labels
when they apply: 

	- DEPENDENCIES: lists observables used internally by the parent to compute its value.
	- MUTATION DEPENDENCIES: lists observables that affect the value of the parent within a specific context.
	- TWO WAY DEPENDENCIES: lists observables cross bound to their parent

Let's inspect the `Person{}.fullName`'s dependencies group:

![logWhatChangesMe dependencies](../node_modules/can-debug/doc/what-changes-me-deps.png)

We can see the same pattern in the output inside the DEPENDENCIES group,

	- The observable's pretty name in the blue border box,
	- The observable's value and object reference in the red border box,
	- And finally the observable's own dependencies in the green border box.

The whole output can be read as:

`Person{}.fullName` derives its value from `Observation<Person{}'s fullName getter>`,
which in turn derive its value from `Person{}.first` and `Person{}.last` values.

**NOTE**: Please note that some of the observables printed out in the console do not 
necessarily match the ones found in application code, as mentioned before, observables 
used internally are listed as dependencies, such is the case of `Observation<Person{}'s fullName getter>` in this example.

Click the button in the example below and inspect the output in the browser's 
console tab.

@demo demos/can-debug/log-what-changes-map.html

Understading the relationships between types is helpful to debug certain kind of 
issues, but most of the time you want to understand what affects other kind of 
observables: DOM nodes.

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

That's a long message! but once you have identified the pattern we discussed before, reading
the output is a lot easier. The observables highlighted in blue border boxes are the most
important to get a high level overview of the output, while the observables in between help 
you make sense of how data flows from the top `<h1>` element to the `<input>` bound to the
`first` property and back to the heading element. 

Click the button in the example below and inspect the output in the browser's console tab:

@demo demos/can-debug/log-what-changes-heading.html

`can-debug` also exports some low level utilities to allow users visualize 
observable dependencies in different ways:

	- `debug.getGraph` returns a directed graph data structure, and 
	- `debug.getDebugData` takes a dependendency graph and returns 
		a deeply nested data structure.

The `graph-visualization` folder in `can-debug` includes examples of how 
`debug.getGraph` can be used to draw the dependency graph using a visualization
library.

## How to write can-debug friendly code

CanJS's internal observables are decorated with metadata and symbols used by
`can-debug` to obtain the dependency graph. 

For most CanJS applications, the default instrumentation should be enough
to get reliable logs from `can-debug`; but some applications using custom 
observable types or authors of CanJS's plugins will have to do some extra work
to make their observables easier to debug.

The following symbols must be implemented:

	- `@@can.getName`: Provide a human readable name for the observable
	- `@@can.getWhatIChange`: The dependencies mutated by the observable
	- `@@can.getKeyDependencies`: The key dependencies of the observable
	- `@@can.getValueDependencies`: The value dependencies of the observable	
	- `@@can.getChangesDependencyRecord`: The dependencies mutated by an event 
		handler (this will most likely be consumed by `@@can.getWhatIChange`).

Apart from the symbols listed above, cases where an observable change triggers a
a mutation in another observable have to be registered using the
`can-reflect-dependencies` package.

E.g:

```js
var counter = new SimpleObservable(0);
var map = new SimpleMap({ foo: "foo" });

map.on("foo", function onFooChange() {
	counter.set(counter.get() + 1);
});

// Registers that counter's value is changed by the map's "foo" property
canReflectDeps.addMutatedBy(counter, {
	keyDependencies: new Map([[map, new Set(["foo"])]]);
});
```
