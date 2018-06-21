/*can-debug@1.2.0#can-debug*/
define([
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-globals',
    './src/proxy-namespace',
    './src/temporarily-bind',
    './src/get-graph/get-graph',
    './src/draw-graph/format-graph',
    './src/draw-graph/draw-graph',
    './src/what-i-change/what-i-change',
    './src/what-changes-me/what-changes-me',
    './src/get-what-i-change/get-what-i-change',
    './src/get-what-changes-me/get-what-changes-me',
    'can-symbol',
    'can-reflect',
    'can-queues',
    'can-diff/merge-deep'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var namespace = require('can-namespace');
        var globals = require('can-globals');
        var proxyNamespace = require('./src/proxy-namespace');
        var temporarilyBind = require('./src/temporarily-bind');
        var getGraph = require('./src/get-graph/get-graph');
        var formatGraph = require('./src/draw-graph/format-graph');
        var drawGraph = require('./src/draw-graph/draw-graph');
        var logWhatIChange = require('./src/what-i-change/what-i-change');
        var logWhatChangesMe = require('./src/what-changes-me/what-changes-me');
        var getWhatIChange = require('./src/get-what-i-change/get-what-i-change');
        var getWhatChangesMe = require('./src/get-what-changes-me/get-what-changes-me');
        var canSymbol = require('can-symbol');
        var canReflect = require('can-reflect');
        var canQueues = require('can-queues');
        var mergeDeep = require('can-diff/merge-deep');
        module.exports = namespace.debug = {
            getGraph: temporarilyBind(getGraph),
            formatGraph: temporarilyBind(formatGraph),
            drawGraph: temporarilyBind(drawGraph),
            getWhatIChange: temporarilyBind(getWhatIChange),
            getWhatChangesMe: temporarilyBind(getWhatChangesMe),
            logWhatIChange: temporarilyBind(logWhatIChange),
            logWhatChangesMe: temporarilyBind(logWhatChangesMe)
        };
        var global = globals.getKeyValue('global');
        global.can = typeof Proxy !== 'undefined' ? proxyNamespace(namespace) : namespace;
        var devtoolsCanModules = {
            Symbol: canSymbol,
            Reflect: canReflect,
            queues: canQueues,
            getGraph: namespace.debug.getGraph,
            formatGraph: namespace.debug.formatGraph,
            mergeDeep: mergeDeep
        };
        if (global.__CANJS_DEVTOOLS__) {
            global.__CANJS_DEVTOOLS__.register(devtoolsCanModules);
        } else {
            Object.defineProperty(global, '__CANJS_DEVTOOLS__', {
                set: function (devtoolsGlobal) {
                    devtoolsGlobal.register(devtoolsCanModules);
                    return devtoolsGlobal;
                }
            });
        }
    }(function () {
        return this;
    }(), require, exports, module));
});