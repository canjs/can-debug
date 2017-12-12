/*can-debug@1.0.0-pre.3#can-debug*/
define([
    'require',
    'exports',
    'module',
    'can-namespace',
    './src/what-i-change/what-i-change',
    './src/what-changes-me/what-changes-me',
    './src/get-what-i-change/get-what-i-change',
    './src/get-what-changes-me/get-what-changes-me'
], function (require, exports, module) {
    var namespace = require('can-namespace');
    var logWhatIChange = require('./src/what-i-change/what-i-change');
    var logWhatChangesMe = require('./src/what-changes-me/what-changes-me');
    var getWhatIChange = require('./src/get-what-i-change/get-what-i-change');
    var getWhatChangesMe = require('./src/get-what-changes-me/get-what-changes-me');
    module.exports = namespace.debug = {
        getWhatIChange: getWhatIChange,
        getWhatChangesMe: getWhatChangesMe,
        logWhatIChange: logWhatIChange,
        logWhatChangesMe: logWhatChangesMe
    };
});