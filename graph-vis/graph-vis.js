var debug = require('can-debug/can-debug');
var draw = require('can-debug/graph-vis/draw');

var stache = require('can-stache');
var DefineMap = require('can-define/map/map');
require('can-stache-bindings');

var ViewModel = DefineMap.extend('PersonVM', {
	first: 'string',
	last: 'string',
	fullName: {
		get: function() {
			return this.first + ' ' + this.last;
		}
	}
});

var tpl = [
	'<h1 id="full">{{fullName}}</h1>',
	'<input id="first" value:bind="first">',
	'<input id="last" value:bind="last">'
];

var view = stache(tpl.join(''));
var viewModel = new ViewModel({ first: 'Jane', last: 'Doe' });
document.querySelector('#slot').appendChild(view(viewModel));

draw(
	document.querySelector('#container'),
	debug.getDirectedGraph(document.querySelector('#full'), { withCycles: false })
);

debug.logWhatChangesMe(document.querySelector('#full'));
