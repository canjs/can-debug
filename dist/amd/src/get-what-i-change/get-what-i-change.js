/*can-debug@2.0.0#src/get-what-i-change/get-what-i-change*/
define([
    'require',
    'exports',
    'module',
    '../get-data/get-data',
    '../get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var getData = require('../get-data/get-data');
    var getGraph = require('../get-graph/get-graph');
    module.exports = function getWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        return getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatIChange');
    };
});