var canViewModel = require("can-view-model");
var DefineMap = require("can-define/map/map");
var draw = require("can-debug/src/draw-graph/draw-graph");

var stache = require("can-stache");
require("can-stache-bindings");

var $slot = document.querySelector("#slot");
var view = stache('<div id="comp" vm:viewModelProp:from="scopeProp"></div>');
var map = new DefineMap({ scopeProp: "Venus" });

$slot.appendChild(view(map));

var vm = canViewModel(document.querySelector("#comp"));
draw(vm, "viewModelProp");
