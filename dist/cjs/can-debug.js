/*can-debug@1.0.0-pre.5#can-debug*/
var namespace = require('can-namespace');
var proxyNamespace = require('./src/proxy-namespace.js');
var logWhatIChange = require('./src/what-i-change/what-i-change.js');
var logWhatChangesMe = require('./src/what-changes-me/what-changes-me.js');
var getWhatIChange = require('./src/get-what-i-change/get-what-i-change.js');
var getWhatChangesMe = require('./src/get-what-changes-me/get-what-changes-me.js');
module.exports = namespace.debug = {
    getWhatIChange: getWhatIChange,
    getWhatChangesMe: getWhatChangesMe,
    logWhatIChange: logWhatIChange,
    logWhatChangesMe: logWhatChangesMe
};
window.can = Proxy != null ? proxyNamespace(namespace) : namespace;