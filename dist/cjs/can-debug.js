/*can-debug@2.0.0#can-debug*/
'use strict';
var namespace = require('can-namespace');
var globals = require('can-globals');
var proxyNamespace = require('./src/proxy-namespace.js');
var temporarilyBind = require('./src/temporarily-bind.js');
var getGraph = require('./src/get-graph/get-graph.js');
var formatGraph = require('./src/format-graph/format-graph.js');
var logWhatIChange = require('./src/what-i-change/what-i-change.js');
var logWhatChangesMe = require('./src/what-changes-me/what-changes-me.js');
var getWhatIChange = require('./src/get-what-i-change/get-what-i-change.js');
var getWhatChangesMe = require('./src/get-what-changes-me/get-what-changes-me.js');
var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');
var canQueues = require('can-queues');
var mergeDeep = require('can-diff/merge-deep/merge-deep');
var global = globals.getKeyValue('global');
var devtoolsRegistrationComplete = false;
function registerWithDevtools() {
    if (devtoolsRegistrationComplete) {
        return;
    }
    var devtoolsGlobalName = '__CANJS_DEVTOOLS__';
    var devtoolsCanModules = {
        Symbol: canSymbol,
        Reflect: canReflect,
        queues: canQueues,
        getGraph: namespace.debug.getGraph,
        formatGraph: namespace.debug.formatGraph,
        mergeDeep: mergeDeep
    };
    if (global[devtoolsGlobalName]) {
        global[devtoolsGlobalName].register(devtoolsCanModules);
    } else {
        Object.defineProperty(global, devtoolsGlobalName, {
            set: function (devtoolsGlobal) {
                Object.defineProperty(global, devtoolsGlobalName, { value: devtoolsGlobal });
                devtoolsGlobal.register(devtoolsCanModules);
            },
            configurable: true
        });
    }
    devtoolsRegistrationComplete = true;
}
module.exports = function () {
    namespace.debug = {
        getGraph: temporarilyBind(getGraph),
        formatGraph: temporarilyBind(formatGraph),
        getWhatIChange: temporarilyBind(getWhatIChange),
        getWhatChangesMe: temporarilyBind(getWhatChangesMe),
        logWhatIChange: temporarilyBind(logWhatIChange),
        logWhatChangesMe: temporarilyBind(logWhatChangesMe)
    };
    registerWithDevtools();
    global.can = typeof Proxy !== 'undefined' ? proxyNamespace(namespace) : namespace;
    return namespace.debug;
};