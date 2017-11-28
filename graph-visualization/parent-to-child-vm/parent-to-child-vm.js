var debug = require("can-debug/can-debug");
var canViewModel = require("can-view-model");
var DefineMap = require("can-define/map/map");
var draw = require("can-debug/graph-visualization/draw");

var stache = require("can-stache");
require("can-stache-bindings");

var $slot = document.querySelector("#slot");
var $container = document.querySelector("#container");

var view = stache('<div id="comp" vm:viewModelProp:from="scopeProp"></div>');
var map = new DefineMap({ scopeProp: "Venus" });
$slot.appendChild(view(map));

var vm = canViewModel(document.querySelector("#comp"));
draw(
	$container,
	debug.getGraph(vm, "viewModelProp")
);
