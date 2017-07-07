import QUnit from 'steal-qunit';
import debug from './can-debug';

import canSymbol from 'can-symbol';
import CIDSet from 'can-util/js/cid-set/cid-set';
import CIDMap from 'can-util/js/cid-map/cid-map';

import Observation from 'can-observation';
import canEvent from 'can-event';
import assign from 'can-util/js/assign/assign';
import CID from 'can-cid';

function MockObservation(cid, keyDeps, valueDeps) {
  this._cid = cid;
  var valueDependencies = new CIDSet();
  var keyDependencies = new CIDMap();

  valueDeps.forEach(function(valueDep) {
    valueDependencies.add(valueDep);
  });

  for (var key in keyDeps) {
    keyDependencies.set(keyDeps[key], [ key ]);
  }

  this[canSymbol.for('can.getValueDependencies')] = function() {
    return {
      valueDependencies: valueDependencies,
      keyDependencies: keyDependencies
    };
  };

  this[canSymbol.for('can.getValue')] = function() {
    return 'value-' + cid;
  };
}

QUnit.module('can-debug');

QUnit.test('basics', function() {
  var keyDepKeyDep = new MockObservation('keyDepKeyDep', {}, []);
  var keyDepValueDep = new MockObservation('keyDepValueDep', {}, []);
  var keyDep = new MockObservation('keyDep', {
    keyDepKeyDep: keyDepKeyDep
  }, [
    keyDepValueDep
  ]);

  var valueDepKeyDep = new MockObservation('valueDepKeyDep', {}, []);
  var valueDepValueDep = new MockObservation('valueDepValueDep', {}, []);
  var valueDep = new MockObservation('valueDep', {
    valueDepKeyDep: valueDepKeyDep
  }, [
    valueDepValueDep
  ]);

  var obs = new MockObservation('obs', { keyDep: keyDep }, [ valueDep ]);

  var debugData = debug(obs);

  QUnit.deepEqual(debugData, {
    cid: 'obs',
    obj: obs,
    value: 'value-obs',
    valueDependencies: [{
      cid: 'valueDep',
      obj: valueDep,
      value: 'value-valueDep',
      valueDependencies: [{
        cid: 'valueDepValueDep',
        obj: valueDepValueDep,
        value: 'value-valueDepValueDep',
        valueDependencies: [],
        keyDependencies: {}
      }],
      keyDependencies: {
        valueDepKeyDep: {
          cid: 'valueDepKeyDep',
          obj: valueDepKeyDep,
          value: 'value-valueDepKeyDep',
          valueDependencies: [],
          keyDependencies: {}
        }
      }
    }],
    keyDependencies: {
      keyDep: {
        cid: 'keyDep',
        obj: keyDep,
        value: 'value-keyDep',
        valueDependencies: [{
          cid: 'keyDepValueDep',
          obj: keyDepValueDep,
          value: 'value-keyDepValueDep',
          valueDependencies: [],
          keyDependencies: {}
        }],
        keyDependencies: {
          keyDepKeyDep: {
            cid: 'keyDepKeyDep',
            obj: keyDepKeyDep,
            value: 'value-keyDepKeyDep',
            valueDependencies: [],
            keyDependencies: {}
          }
        }
      }
    }
  });
});

QUnit.test('works with can-observation', function() {
	var obs1 = assign({prop1: 1}, canEvent);
  CID(obs1);

  var obs2 = function() {
    return 2;
  };
  CID(obs2);
  obs2[canSymbol.for('can.onValue')] = function() {};
  obs2[canSymbol.for('can.offValue')] = function() {};
  obs2[canSymbol.for('can.getValue')] = function() {
    return this();
  };

	var observation = new Observation(function() {
		Observation.add(obs1, 'prop1');
		Observation.add(obs2);
		return obs1.prop1 + obs2();
	});
	observation.start();

  try {
    debug(observation);
    QUnit.ok(true, 'should not throw');
  } catch(e) {
    QUnit.ok(false, e);
  }
});
