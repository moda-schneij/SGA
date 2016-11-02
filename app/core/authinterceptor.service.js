'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:authInterceptor
 * @description
 * # authInterceptor
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class AuthInterceptorSvc {
  /*@ngInject*/
  constructor($log, $rootScope, $q, ConstantsSvc, TokenSvc, UserSvc, $injector, $timeout) {
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.ConstantsSvc = ConstantsSvc;
    this.TokenSvc = TokenSvc;
    this.UserSvc = UserSvc;
    this.$injector = $injector;
    this.$timeout = $timeout;
    ['request', 'requestError', 'response', 'responseError', 'requiresAuth'] //bind core interceptor methods to the class
        .forEach((method) => {
          if(this[method]) {
            this[method] = this[method].bind(this);
          }
        });
  }

  request(config) {
    this.$log.debug ('the route config in getRequest');
    this.$log.debug(config);
    if (config.url) {
      if (config.url.indexOf(this.ConstantsSvc.API_URL) > -1) { //we only need to send the token on REST API requests
        var token = this.TokenSvc.getToken(); //here is where we add the token bearer header to each request
        config.headers = config.headers || {};
        config.headers['X-Auth-Token-Request'] = 'true';
        if (token) { //once we have the token (ie, after login)
          //config.headers.Authorization = 'Bearer ' + token; //this would be the standard, but we are using a custom header, X-Auth-Token
          config.headers['X-Auth-Token'] = token;
        }
      }
    }
    return config;
  }

  requestError(rejection) {
    this.$log.debug('Request error: ');
    this.$log.debug(rejection);
    return this.$q.reject(rejection);
  }

  response(responseVal) {
    const responseHeaders = responseVal.headers();
    let infoMsgInResponse = false;
    let errorMsgInResponse = false;

    parseResponseToken.call(this, responseHeaders);

    for (var prop in responseVal.data) {
      if (prop.indexOf('infoMsg') > -1) {
        infoMsgInResponse = true;
      }
      if (prop.indexOf('errorMsg') > -1) {
        errorMsgInResponse = true;
      }
    }
    return responseVal || this.$q.when(responseVal);
  }

  responseError(responseVal) {
    this.$log.debug('Response error: ');
    this.$log.debug(responseVal);
    return this.$q.reject(responseVal);
  }

  requiresAuth(nextRoute) {
    var route = nextRoute.$$route;
    if (route) {
      if (route.settings) {
        var authFlag = route.settings.loginRequired ? route.settings.loginRequired : false;
        return authFlag;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

}

function parseResponseToken(responseHeaders) {
  let token = '';
  const TimeoutSvc = this.$injector.get('TimeoutSvc'); //inject here to avoid Angular dependency hell from compile and http
  for (const header in responseHeaders) {
    if (header === 'x-auth-token' && responseHeaders[header].length > 0) { //check for the token header and make sure there's something in it
      this.$log.debug('Response header is:: ' + header);
      token = responseHeaders[header] ? responseHeaders[header] : '';
      this.$log.debug('Token in parseResponseToken is:: ' + token);
      this.TokenSvc.setToken(token); //add the token to localStorage, to be retrieved for the next request using getToken
      $timeout(() => {
        const isLoggedIn = this.UserSvc.getIsLoggedIn();
        if (isLoggedIn) {
          TimeoutSvc.setUserTimeout(); //update the app timeout
        } else {
          TimeoutSvc.cancelUserTimeout();
        }
      });
      this.$rootScope.$broadcast('tokenUpdate');
    }
  }
}
