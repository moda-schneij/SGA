'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:authentication
 * @description
 * # Authentication
 * Service of the Small Group Application App
 */

import angular from 'angular';
const failedCheckinMessage = require('!html!../templates/failedcheckin.html');
let messageToPost = {};

export default class AuthenticationSvc {

  /*@ngInject*/
  constructor($state, $log, $q, $timeout, $window, $cookies, $location, $rootScope, DataSvc, UtilsSvc, DialogSvc, StorageSvc, TokenSvc, SpinnerControlSvc, UserSvc, XdMessagingSvc, MessagesSvc, STORAGE_KEYS, REFERRER_COOKIE, ConstantsSvc) {
    this.$state = $state;
    this.$log = $log;
    this.$q = $q;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$cookies = $cookies;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.DataSvc = DataSvc;
    this.UtilsSvc = UtilsSvc;
    this.DialogSvc = DialogSvc;
    this.StorageSvc = StorageSvc;
    this.TokenSvc = TokenSvc;
    this.SpinnerControlSvc = SpinnerControlSvc;
    this.UserSvc = UserSvc;
    this.XdMessagingSvc = XdMessagingSvc;
    this.MessagesSvc = MessagesSvc;
    this.TOKEN_KEY = STORAGE_KEYS.TOKEN_KEY;
    this.APPID_KEY = STORAGE_KEYS.APPID_KEY;
    this.REFERRER_COOKIE = REFERRER_COOKIE;
    this.ConstantsSvc = ConstantsSvc;
    this.unsavedChangesDialog = this.unsavedChangesDialog.bind(this);
    this.returnToSER = this.returnToSER.bind(this);
    this.handleUnauth = this.handleUnauth.bind(this);
    this.loginRequired = false;
  }

  login(user, e) {
    e.preventDefault();
    this.SpinnerControlSvc.startSpin({overlay: true});
    this.TokenSvc.setToken('');
    this.$cookies.remove('JSESSIONID', {
      path: '/',
      domain: this.$location.host()
    });
    messageToPost = {
      xdLoginRequest: {
        username: user.username,
        password: user.password
      }
    };
    this.XdMessagingSvc.postMessage(messageToPost);
  }

  logout(logoutParams) {
    messageToPost = {
      xdLogoutRequest: true
    };
    const dirty = logoutParams && logoutParams.dirty;
    const invalid = logoutParams && logoutParams.invalid;
    const skipSaveChanges = logoutParams && logoutParams.skipSaveChanges;
    this.$log.debug('logging out, going to: ' + this.ConstantsSvc.SER_CONTEXT ? this.ConstantsSvc.SER_URL : 'login');

    //form state is not being predictable, so always show the dialog
    if (!skipSaveChanges) {
      this.unsavedChangesDialog({logout: true});
    } else {
      performLogout.call(this, logoutParams);
    }
    // if (dirty) {
    //   this.unsavedChangesDialog({logout: true});
    // } else {
    //   //TODO - pass params to performLogout
    //   performLogout.call(this, logoutParams);
    // }
  }

  handleUnauth(response, loginRequired) {
    let logEmOut = true;
    let expired = false;
    if (angular.isObject(response)) {
      const statusLogout = (/-1|401|419/).test(response.status);
      const statusCodeLogout = (/401|419/).test(response.statusCode);
      const statusTextLogout = angular.isString(response.statusText) && response.statusText.toLowerCase() === 'unauthorized';
      expired = (/419/).test(response.status) || (/419/).test(response.statusCode);
      logEmOut = loginRequired && (statusLogout || statusCodeLogout || statusTextLogout);
    }
    if (logEmOut) {
      performLogout.call(this,
        {
          expired: expired,
          error: !expired
        }
      );
    }
  }

  unsavedChangesDialog(option) {
    const logout = option && option.logout;
    const checkin = option && option.checkin;
    const appId = option && option.appId ? option.appId : this.StorageSvc.getSessionStore(this.APPID_KEY);
    const action = logout ? ' to logout' : checkin ? ' back to SpeedERates' : '';
    const confirmButtonText = logout ? 'Logout' : 'Return to SpeedERates';
    const confirmDialog = this.DialogSvc.confirm({
      heading: 'Are you sure?',
      text: `
        <p>If you have any unsaved changes, they will be lost. 
        You can cancel this request and save or continue your work, 
        or proceed${action}.</p>
      `,
      confirmButton: confirmButtonText,
      cancelButton: 'Continue application'
    }, {
      appendClassName: 'dialog-sga-normal'
    });
    if (checkin) {
      return confirmDialog;
    } else {
      confirmDialog.then(
        function(value) {
          performLogout.call(this);
        }.bind(this),
        function(reason) {
          this.$log.debug('cancelling logout');
        }.bind(this)
      );
    }
  }

  returnToSER() {
    const currToken = this.TokenSvc.getToken();
    this.$window.addEventListener('message', handlePostMessage.bind(this), false);
    this.$timeout(() => {
      this.MessagesSvc.clearAll(); //clear all messages
      this.StorageSvc.clearStores();
      this.TokenSvc.setToken(currToken); //re-set the token after clearing the rest of the storage vals
      messageToPost = {
        xdSetToken: currToken
      };
      this.XdMessagingSvc.postMessage(messageToPost);
    }, 0, false, this);
  }

  getIsLoggedIn(next) {
    this.loginRequired = (next && next.routeData && next.routeData.data && next.routeData.data.loginRequired) ?
      next.routeData.data.loginRequired : true;
    // var authRequired = AuthInterceptorSvc.requiresAuth(next); //doesn't work
    // $log.debug('reqiuresAuth? ' + authRequired); //this was a failed test to see if I could figure out whether auth was required
    return this.DataSvc.ping().then(
      getLoggedInSuccess.bind(this),
      getLoggedInError.bind(this)
    ); //this is the logic that actually works
  }

}

//on verified success, the call to UserSvc.setIsLoggedIn triggers navigation to the application forms
function getLoggedInSuccess(response) {
  const deferred = this.$q.defer();
  this.handleUnauth(response, this.loginRequired); //if this happens to be an error??
  if (response.statusCode === '200' || response.status === 200 || response.statusText === 'OK') {
    this.$log.debug(response);
    const isLoggedIn = this.UserSvc.getIsLoggedIn();
    if (!isLoggedIn) {
      this.UserSvc.setIsLoggedIn(); //triggers navigation to the application forms
    }
    deferred.resolve(true);
  } else {
    this.$log.debug(response);
    getLoggedInError.call(this, 'cannot get logged in status');
    deferred.reject(false);
  }
  return deferred.promise;
}

function getLoggedInError(response) { //handle failure to login thru ping
  const deferred = this.$q.defer();
  this.$log.error(response);
  deferred.reject(false);
  this.handleUnauth(response, this.loginRequired);
  return deferred.promise;
}

function handlePostMessage(event) {
  if (event.data.xdTokenStoredMessage) {
    this.$window.location.href = this.ConstantsSvc.SER_ROOT_URL + '/faces/pages/agentHome.xhtml?faces-redirect=true';
    this.SpinnerControlSvc.startSpin({overlay: true});
    this.$timeout(() => {
      this.SpinnerControlSvc.stopSpin(); //in case something messes up or it takes too long to navigate
    }, 30000, false, this);
  }
}

function clearSession() {
  this.$cookies.remove('JSESSIONID', {
    path: '/'
  });
}

function performLogout(logoutParams) {
  const error = logoutParams && logoutParams.error;
  const expired = logoutParams && logoutParams.expired;
  const appId = this.StorageSvc.getSessionStore(this.APPID_KEY);
  if (appId) {
    this.DataSvc.application.checkin(appId).then( //just try to checkin here, no error handling
      (response) => {
        this.$log.debug('checkin called from performLogout');
        this.$log.debug(response);
      },
      (reason) => {
        this.$log.debug('failed checkin called from performLogout');
        this.$log.debug(reason);
      }
    )
    .finally(
      continueFn.bind(this)
    )
  } else {
    continueFn.call(this);
  }
  function continueFn() {
    this.StorageSvc.clearStores();
    clearSession.call(this);
    clearReferrerCookie.call(this);
    this.XdMessagingSvc.postMessage(messageToPost);
    this.$rootScope.$emit('logout'); //replaced $broadcast with $emit to limit event propagation
    if (error || expired) {
      expiredOrErrorDialog.call(this);
    } else {
      logoutSuccess.call(this);
    }
  }
}

function expiredOrErrorDialog() {
  this.DialogSvc.acknowledge({
    heading: 'You are being logged out',
    text: `
      <p>Your session is expired or invalid. Please login again.</p>
    `
  }).then(() => {
    logoutSuccess.call(this);
  });
}

function logoutSuccess() {
  this.MessagesSvc.clearAll(); //clear all messages
  if (this.ConstantsSvc.SER_CONTEXT) {
    this.$window.location.href = this.ConstantsSvc.SER_ROOT_URL;
  } else {
    //eslint-disable-next-line no-undefined
    this.$state.go('LoginView', undefined, { reload: true });
  }
}

function clearReferrerCookie() {
  this.$cookies.remove(this.REFERRER_COOKIE, {
    path: '/'
  });
}
