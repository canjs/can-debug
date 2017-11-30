/*can-debug@1.0.0-pre.2#can-debug*/
define([
    'require',
    'exports',
    'module',
    'can-namespace',
    './src/get-data/get-data',
    './src/get-graph/get-graph',
    './src/what-i-change/what-i-change',
    './src/what-changes-me/what-changes-me'
], function (require, exports, module) {
    var namespace = require('can-namespace');
    var getData = require('./src/get-data/get-data');
    var getGraph = require('./src/get-graph/get-graph');
    var logWhatIChange = require('./src/what-i-change/what-i-change');
    var logWhatChangesMe = require('./src/what-changes-me/what-changes-me');
    module.exports = namespace.debug = {
        getGraph: getGraph,
        getDebugData: getData,
        logWhatIChange: logWhatIChange,
        logWhatChangesMe: logWhatChangesMe
    };
});