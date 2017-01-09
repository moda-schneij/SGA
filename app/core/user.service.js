'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:user
 * @description
 * # User
 * Service of the Small Group Application app
 */

//an injectable service for providing constants that take angular dependencies

import angular from 'angular';
const moduleName = 'sgAppUserSvc';

class UserSvc {

  /*@ngInject*/
  constructor(StorageSvc, ConstantsSvc, DialogSvc, STORAGE_KEYS, $log, $q, $rootScope, $rootRouter) {
    this.StorageSvc = StorageSvc;
    this.ConstantsSvc = ConstantsSvc;
    this.DialogSvc = DialogSvc;
    this.LOGGED_IN_KEY = STORAGE_KEYS.LOGGED_IN_KEY;
    this.TOKEN_KEY = STORAGE_KEYS.TOKEN_KEY;
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$rootRouter = $rootRouter;
  }

  getIsLoggedIn() {
    //if either the logged-in key or token key has been wiped, this user is invalid
    const loggedInVal = this.StorageSvc.getSessionStore(this.LOGGED_IN_KEY);
    const tokenVal = this.StorageSvc.getSessionStore(this.TOKEN_KEY);
    return !!loggedInVal && !!tokenVal; //casts null and undefined as false, but bools as their actual value
  }

  setIsLoggedIn() {
    this.StorageSvc.setSessionStore(this.LOGGED_IN_KEY, true);
    if (!this.ConstantsSvc.SER_CONTEXT) {
      this.DialogSvc.acknowledge({
        heading: 'You\'ve logged in!'
      }).then(
        confirmSuccess.bind(this),
        confirmError.bind(this)
      );
    } else {
      confirmSuccess.call(this);
    }
  }

  loginFailed() {
    this.DialogSvc.acknowledge({
      heading: 'There was a problem logging in',
      text: '<p>Either your username or password were incorrect or you have a stale token.</p>' +
        '<p>Please check your username and password or clear your session and cache and try again.</p>'
    });
  }

  removeIsLoggedIn() {
    this.StorageSvc.removeSessionStore(this.LOGGED_IN_KEY);
  }

}

function confirmSuccess() {
  this.$rootScope.$emit('loginSuccess');
  this.$rootRouter.navigate(['ApplicationView', {}]);
}

function confirmError(e) {
  this.$log.error(e);
}

export default angular
  .module(moduleName, [])
  .service('UserSvc', UserSvc);
