/*can-debug@1.0.0#can-debug*/
var namespace = require('can-namespace');
var proxyNamespace = require('./src/proxy-namespace.js');
var temporarilyBind = require('./src/temporarily-bind.js');
var drawGraph = require('./src/draw-graph/draw-graph.js');
var logWhatIChange = require('./src/what-i-change/what-i-change.js');
var logWhatChangesMe = require('./src/what-changes-me/what-changes-me.js');
var getWhatIChange = require('./src/get-what-i-change/get-what-i-change.js');
var getWhatChangesMe = require('./src/get-what-changes-me/get-what-changes-me.js');
module.exports = namespace.debug = {
    drawGraph: temporarilyBind(drawGraph),
    getWhatIChange: temporarilyBind(getWhatIChange),
    getWhatChangesMe: temporarilyBind(getWhatChangesMe),
    logWhatIChange: temporarilyBind(logWhatIChange),
    logWhatChangesMe: temporarilyBind(logWhatChangesMe)
};
window.can = Proxy != null ? proxyNamespace(namespace) : namespace;