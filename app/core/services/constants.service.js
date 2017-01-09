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

export default class ConstantsSvc {

  /*@ngInject*/
  constructor($log, $location, $cookies, StorageSvc, SER_LOGIN_PATH, SER_APPNAME, API_ROOT_PATH, STORAGE_KEYS) {
    this.$log = $log;
    this.StorageSvc = StorageSvc;
    this.STORAGE_KEYS = STORAGE_KEYS;
    this.SER_LOGIN_PATH = SER_LOGIN_PATH;
    this.WEB_PORT = (__WEB_PORT__ && __WEB_PORT__.toString() !== '80') ? (':' + __WEB_PORT__) : '';
    this.WS_PORT = (__WS_PORT__ && __WS_PORT__.toString() !== '80') ? (':' + __WS_PORT__) : '';
    this.SER_PORT = (__SER_PORT__ && __SER_PORT__.toString() !== '80') ? (':' + __SER_PORT__) : '';
    this.NODE_ENV = __NODE_ENV__ || null;
    this.SER_CONTEXT = __SER_CONTEXT__ || false;
    this.PROD = __PROD__ || false;
    this.hasRemoteHost = !!__REMOTE_HOST__ && __REMOTE_HOST__ !== '' && (/odshp/).test(__REMOTE_HOST__);
    this.hostForSERAndWS = this.hasRemoteHost ? __REMOTE_HOST__ : $location.host();
    this.hostPlusProtocol = (this.hasRemoteHost ? 'http' : $location.protocol()) + '://' + this.hostForSERAndWS;
    //setting context root with a fallback for a missing cookie or cookie service
    this.SER_CONTEXT_ROOT = $cookies && $cookies.get('ser_app_context') ? '/' + $cookies.get('ser_app_context') : '/SpeedERatesWeb';
    this.portToUse = (port) => (!this.hasRemoteHost ? port : '');
    this.API_URL = (!this.hasRemoteHost ? '//' : 'http://') + this.hostForSERAndWS +
      this.portToUse(this.WS_PORT) + API_ROOT_PATH;
    this.SER_ROOT_URL = this.hostPlusProtocol + this.portToUse(this.SER_PORT) + '/' + SER_APPNAME;
    this.SER_URL = this.hostPlusProtocol + this.portToUse(this.SER_PORT) + SER_LOGIN_PATH;
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
