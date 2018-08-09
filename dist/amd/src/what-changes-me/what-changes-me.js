/*can-debug@2.0.0#src/what-changes-me/what-changes-me*/
define([
    'require',
    'exports',
    'module',
    '../log-data/log-data',
    '../get-data/get-data',
    '../get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var log = require('../log-data/log-data');
    var getData = require('../get-data/get-data');
    var getGraph = require('../get-graph/get-graph');
    module.exports = function logWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        var data = getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatChangesMe');
        if (data) {
            log(data);
        }
    };
});