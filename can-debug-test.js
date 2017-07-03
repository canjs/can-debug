import QUnit from 'steal-qunit';
import plugin from './can-debug';

QUnit.module('can-debug');

QUnit.test('exports a function', function(){
  QUnit.equal(typeof plugin, 'function');
});
