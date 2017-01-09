'use strict';

//FILE RESOLUTION DEPENDS ON WEBPACK RESOLVE ROOT IN webpack.config-test

const helpers = require('testing/test.helper');
const ngModule = helpers.module;
const inject = helpers.inject;
const localStorage = helpers.localStorage;
const sessionStorage = helpers.sessionStorage;

require('core/services/sgApp.core.services');

const expect = require('chai').expect;
const assert = require('chai').assert;

describe('Services: ', function() {
  
  // load the service's module
  var StorageSvc, $window, getObjVal, getArrVal, getStringVal, getBoolVal, getNumVal;

  var specObjVal = { foo: { bar: "baz" } };
  var specArrVal = [specObjVal, 1, 'boink', false];
  var specBoolVal = true;
  var specStringVal = 'boink';
  var specNumVal = 30.25;

  var typeArr = ['Local', 'Session'];

  //console.log('what is my mocked localstorage?');
  //console.log(localStorage);

  beforeEach(ngModule('sgAppCoreSvcs'));

  beforeEach(inject(function(_StorageSvc_, _$window_) {
    StorageSvc = _StorageSvc_;
    $window = _$window_;
    $window.localStorage = localStorage;
    $window.sessionStorage = sessionStorage;
  }));

  typeArr.forEach(function(type) {
    var setter = 'set' + type + 'Store';
    var getter = 'get' + type + 'Store';
    var remover = 'remove' + type + 'Store';

    describe('StorageSvc: ', function() {
      describe(type + 'Storage: ', function() {
        beforeEach(function() {
          StorageSvc[setter]('specObj', specObjVal);
          StorageSvc[setter]('specArr', specArrVal);
          StorageSvc[setter]('specBool', specBoolVal);
          StorageSvc[setter]('specString', specStringVal);
          StorageSvc[setter]('specNum', specNumVal);

          getObjVal = StorageSvc[getter]('specObj');
          getArrVal = StorageSvc[getter]('specArr');
          getBoolVal = StorageSvc[getter]('specBool');
          getNumVal = StorageSvc[getter]('specNum');
          getStringVal = StorageSvc[getter]('specString');
        });

        describe('Store and retrieve object: ', function() {
          it('Should set an object in session storage and retrieve that object', function() {
            expect(getObjVal).to.deep.equal(specObjVal);
          });
        });

        describe('Store and retrieve array: ', function() {
          it('Should set an array in local storage and retrieve that array', function() {
            expect(getArrVal).to.eql(specArrVal);
            assert.isArray(getArrVal);
          });
        });

        describe('Store and retrieve boolean: ', function() {
          it('Should set an boolean in local storage and retrieve that boolean', function() {
            expect(getBoolVal).to.equal(specBoolVal).and.to.be.a('boolean');
          });
        });

        describe('Store and retrieve number: ', function() {
          it('Should set an number in local storage and retrieve that number', function() {
            expect(getNumVal).to.equal(specNumVal).and.to.be.a('number');
          });
        });

        describe('Store and retrieve string: ', function() {
          it('Should set an string in local storage and retrieve that string', function() {
            expect(getStringVal).to.equal(specStringVal).and.to.be.a('string');
          });
        });

        describe('Delete item in store: ', function() {
          beforeEach(function() {
            StorageSvc[remover]('specObj');
            getObjVal = StorageSvc[getter]('specObj');
          });
          it('Should get null after the object in session storage is removed', function() {
            expect(getObjVal).to.be.null;
          });
        });

        afterEach(function() {
          StorageSvc[remover]('specObj');
          StorageSvc[remover]('specArr');
          StorageSvc[remover]('specBool');
          StorageSvc[remover]('specString');
          StorageSvc[remover]('specNum');
        });
      });
    });
  });

});
