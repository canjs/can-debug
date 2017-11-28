@module {Object} can-debug
@parent can-observables
@collection can-ecosystem
@alias can.debug

@description Useful debugging utilities.

@type {Object}

`can-debug` provides methods that show how different parts of an application
effect each other, specifically CanJS's observables and the DOM.


Exports an object with the following methods:

```js
{
	getGraph // Get the observable dependency graph
	getDebugData
	logWhatIChange
	logWhatChangesMe
}
```


@body


## Use cases

- See how observables affect each other.

## Use

one little example

```js
var fullName = new Observe()


debug.logWhatChangesMe(abc)
```

@demo


one more complex w/ components + stache-bindings


## How to work with this
