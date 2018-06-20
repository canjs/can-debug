/*can-debug@1.1.0#can-debug*/
var namespace = require('can-namespace');
var proxyNamespace = require('./src/proxy-namespace.js');
var temporarilyBind = require('./src/temporarily-bind.js');
var getGraph = require('./src/get-graph/get-graph.js');
var formatGraph = require('./src/draw-graph/format-graph.js');
var drawGraph = require('./src/draw-graph/draw-graph.js');
var logWhatIChange = require('./src/what-i-change/what-i-change.js');
var logWhatChangesMe = require('./src/what-changes-me/what-changes-me.js');
var getWhatIChange = require('./src/get-what-i-change/get-what-i-change.js');
var getWhatChangesMe = require('./src/get-what-changes-me/get-what-changes-me.js');
var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');
var canQueues = require('can-queues');
var mergeDeep = require('can-diff/merge-deep/merge-deep');
module.exports = namespace.debug = {
    getGraph: temporarilyBind(getGraph),
    formatGraph: temporarilyBind(formatGraph),
    drawGraph: temporarilyBind(drawGraph),
    getWhatIChange: temporarilyBind(getWhatIChange),
    getWhatChangesMe: temporarilyBind(getWhatChangesMe),
    logWhatIChange: temporarilyBind(logWhatIChange),
    logWhatChangesMe: temporarilyBind(logWhatChangesMe)
};
window.can = typeof Proxy !== 'undefined' ? proxyNamespace(namespace) : namespace;
if (window.__CANJS_DEVTOOLS__) {
    window.__CANJS_DEVTOOLS__.register({
        Symbol: canSymbol,
        Reflect: canReflect,
        queues: canQueues,
        getGraph: namespace.debug.getGraph,
        formatGraph: namespace.debug.formatGraph,
        mergeDeep: mergeDeep
    });
}