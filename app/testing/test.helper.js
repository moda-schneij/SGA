'use strict';

const jsdom = require('jsdom').jsdom;
const Storage = require('dom-storage');
const localStorage = new Storage('./db.json', { strict: false, ws: '  ' });
const sessionStorage = new Storage(null, { strict: true });

//add simple spies plugin
const chai = require('chai');
const chaiSpies = require('chai-spies');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiSpies);
chai.use(chaiAsPromised);

//add sinon and syntax integrator for sinon with chai
const sinon = require('sinon');
//const sinonChai = require('sinon-chai');
//chai.use(sinonChai);
sinon.assert.expose(chai.assert, { prefix: "" });

const expect = chai.expect;
const assert = chai.assert;

var document = global.document = jsdom('<html><head></head><body></body></html>');
var window = global.window = document.defaultView;

global.navigator = window.navigator = {};
global.Node = window.Node;

//hard-code globals configured on the fly by webpack
global.__WEB_PORT__ = '80';
global.__WS_PORT__ = '80';
global.__SER_PORT__ = '80';
global.__NODE_ENV__ = 'production';
global.__BUILD_TARGET__ = 'build';
global.__SER_CONTEXT__ = true;
global.__PROD__ = true;

/*
 * angular-mocks
 */

window.mocha = {};
window.beforeEach = global.beforeEach;
window.afterEach = global.afterEach;

/*
 * Since angular and angular-mocks are both singletons created once with one window-object
 * and mocha doesn't reload modules from node_modules on watch mode we'll have to
 * invalidate the cached singletons manually.
 */

delete require.cache[require.resolve('angular')];
delete require.cache[require.resolve('angular/angular')];
delete require.cache[require.resolve('angular-mocks')];

require('angular/angular');
require('angular-mocks');

global.angular = window.angular;

//console.log('what is angular mock module here?');
//console.log(window.angular.mock.module);
//console.log('what is angular mock here?');
//console.log(window.angular.mock);

// angular.mock.inject(function($window){
//   $window.localStorage = $localStorage;
//   $window.sessionStorage = $sessionStorage;
// });

module.exports = {
    inject: window.angular.mock.inject,
    module: window.angular.mock.module,
    localStorage: localStorage,
    sessionStorage: sessionStorage,
    expect: expect,
    assert: assert,
    spy: chai.spy,
    should: chai.should()
};