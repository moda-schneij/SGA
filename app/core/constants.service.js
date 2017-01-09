'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:constants
 * @description
 * # Constants
 * Service of the Small Group Application app
 */

 //an injectable service for providing constants that take angular dependencies

import angular from 'angular';
const moduleName = 'sgAppConstantsSvc';

//these are globals defined by webpack DefinePlugin, set by the build type from package.json
/* eslint-disable no-undef */

const WEB_PORT = (__WEB_PORT__ && __WEB_PORT__.toString() !== '80') ? (':' + __WEB_PORT__) : '';
const WS_PORT = (__WS_PORT__ && __WS_PORT__.toString() !== '80') ? (':' + __WS_PORT__) : '';
const SER_PORT = (__SER_PORT__ && __SER_PORT__.toString() !== '80') ? (':' + __SER_PORT__) : '';
const NODE_ENV = __NODE_ENV__ || null;
const BUILD_TARGET = __BUILD_TARGET__ || null;
const SER_CONTEXT = __SER_CONTEXT__ || false;
const PROD = __PROD__ || false;

/* eslint-enable no-undef */

class ConstantsSvc {

  /*@ngInject*/
  constructor($log, $location, $window, $cookies, StorageSvc, SER_LOGIN_PATH, SER_APPNAME, SGA_PATH, API_ROOT_PATH, STG3_URL, STORAGE_KEYS) {
    this.$log = $log;
    this.$location = $location;
    this.$window = $window;
    this.$cookies = $cookies;
    this.StorageSvc = StorageSvc;
    this.STORAGE_KEYS = STORAGE_KEYS;
    this.SER_LOGIN_PATH = SER_LOGIN_PATH;
    this.SER_APPNAME = SER_APPNAME;
    this.API_ROOT_PATH = API_ROOT_PATH;
    this.SER_CONTEXT = SER_CONTEXT;
    //setting context root with a fallback for a missing cookie or cookie service
    this.SER_CONTEXT_ROOT = $cookies && $cookies.get('ser_app_context') ? '/' + $cookies.get('ser_app_context') : '/SpeedERatesWeb';
    
    //Switching back and forth between paths depending on whether developing against local or STG3, and whether you have a working local SER installed
    
    // this.API_URL = (function(){
    //   return SER_CONTEXT ?
    //     '//' + $location.host() + WS_PORT + API_ROOT_PATH :
    //     STG3_URL + API_ROOT_PATH;
    // }());
    // this.SER_ROOT_URL = (function(){
    //   return SER_CONTEXT ?
    //     $location.protocol() + '://' + $location.host() + SER_PORT + '/' + SER_APPNAME :
    //     STG3_URL + '/' + SER_APPNAME;
    // }());
    // this.SER_URL = (function(){
    //   return SER_CONTEXT ?
    //     $location.protocol() + '://' + $location.host() + SER_PORT + SER_LOGIN_PATH :
    //     STG3_URL + SER_LOGIN_PATH;
    // }());
    
    this.API_URL = '//' + $location.host() + WS_PORT + API_ROOT_PATH;
    this.SER_ROOT_URL = $location.protocol() + '://' + $location.host() + SER_PORT + '/' + SER_APPNAME;
    this.SER_URL = $location.protocol() + '://' + $location.host() + SER_PORT + SER_LOGIN_PATH;

    //this.APP_URL = $location.protocol() + '://' + $location.host() + WEB_PORT + '/' + SER_APPNAME + SGA_PATH;
    //I think what's commented out above is incorrect. Not sure this is being used anywhere yet, anyway, but seems it should just be an addition to the SpeedE root URL
    this.APP_URL = this.SER_ROOT_URL + SGA_PATH;

    this.tipsoConfigWidth = 200;
  }

  get ELIGIBILITY_PERIODS() {
    return this.SER_OPTIONS.eligibilityPeriods || [];
  }

  get DOMESTIC_PARTNER_TYPES() {
    return this.SER_OPTIONS.coverForDomesticPartner || [];
  }

  get REPORT_TYPES() {
    return this.SER_OPTIONS.reportTypes || [];
  }

  get SER_OPTIONS() {
    return this.StorageSvc.getSessionStore(this.STORAGE_KEYS.OPTIONS_KEY) || {};
  }

  get TIPSOCONFIG() {
    return {
      background: '#e3f2f0',
      maxWidth: this.tipsoConfigWidth + 'px',
      width: false
    };
  }

  set TIPSOCONFIG(config) {
    if (config) {
      if (config.width) {
        this.tipsoConfigWidth = config.width;
      }
    }
  }
}

export default angular
  .module(moduleName, [])
  .service('ConstantsSvc', ConstantsSvc);
