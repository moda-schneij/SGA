'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:token
 * @description
 * # Token
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class TokenSvc {

  /*@ngInject*/
  constructor(StorageSvc, STORAGE_KEYS, SpinnerControlSvc, UserSvc, $log, $window) {
    this.StorageSvc = StorageSvc;
    this.TOKEN_KEY = STORAGE_KEYS.TOKEN_KEY;
    this.SpinnerControlSvc = SpinnerControlSvc;
    this.UserSvc = UserSvc;
    this.$log = $log;
    this.$window = $window;
  }

  //TODO - rework as real getter and setter

  setToken(token) {
    try {
      //this.$log.debug('Inside setToken, the token is:: ' + token);
      if (token && token !== '') {
        this.StorageSvc.setSessionStore(this.TOKEN_KEY, token);
      } else {
        this.StorageSvc.removeSessionStore(this.TOKEN_KEY);
      }
    } catch (exception) {
      this.$log.error('There was a problem either setting or clearing the token on the client::' + exception);
    }
  }

  getToken() {
    var returnVal = this.StorageSvc.getSessionStore(this.TOKEN_KEY);
    returnVal = returnVal === 'null' || angular.isUndefined(returnVal) ? null : returnVal;
    return returnVal;
  }
  
}

