@function can-debug.drawGraph drawGraph
@parent can-debug

@description Draws the dependency graph of an observable.

@signature `debug.drawGraph(observable, [key])`

Draws the dependency graph of the observable passed in as an argument, that is, it
displays nodes which represent other observables and arrows that connect these nodes;
each arrow represents the direction of the dependency. 

Given two nodes A and B, if there is an arrow from A to B, it can be read as the
observable represented by the node A affects the value of the observable represented
by the node B, or that node B derives its value from node A. 

If a `key` is provided, `drawGraph` draws what affects and is affected by the `key` 
of the observable.

The following example uses `DefineMap` to create a `Person` type with a `fullName`
property that derives its value from `first` and `last`. Then it calls `drawGraph` 
to display (in a new browser window) the dependency graph of the `fullName` property 
of the `me` Person instance:

```js
import debug from "can-debug";

const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	fullName: {
		get() {
			return `${this.first} ${this.last}`;
		}
	}
} );

const me = new Person( { first: "John", last: "Doe" } );
debug.drawGraph( me, "fullName" );
```

Calling `debug.drawGraph` opens up a new browser window like this:

<img class="bit-docs-screenshot" alt="dependencyGraph" src="../node_modules/can-debug/doc/map-dependency-graph.png">

@param {Object} observable An observable.
@param {Any} [key] The key of a property on a map-like observable.
