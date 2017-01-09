'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:authInterceptor
 * @description
 * # authInterceptor
 * Service of the Small Group Application app
 */

import angular from 'angular';
const moduleName = 'sgAppAuthInterceptorSvc';

/*@ngInject*/
function AuthInterceptorSvc ($log, $rootScope, $q, ConstantsSvc, TokenSvc, UserSvc, $injector, $timeout) {

  const service = {
    request: request,
    response: response,
    requestError: requestError,
    responseError: responseError,
    requiresAuth: requiresAuth
  };

  return service;

  function request(config) {
    $log.debug ('the route config in getRequest');
    $log.debug(config);
    if (config.url) {
      if (config.url.indexOf(ConstantsSvc.API_URL) > -1) { //we only need to send the token on REST API requests
        var token = TokenSvc.getToken(); //here is where we add the token bearer header to each request
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

  function requestError(rejection) {
    $log.debug('Request error: ');
    $log.debug(rejection);
    return $q.reject(rejection);
  }

  function response(responseVal) {
    const responseHeaders = responseVal.headers();
    let infoMsgInResponse = false;
    let errorMsgInResponse = false;

    $log.debug('Response status is: ' + responseVal.status);
    $log.debug('Response URL is: ' + responseVal.config.url);
    $log.debug('Response data is: ');
    $log.debug(response.data);

    parseResponseToken(responseHeaders);

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

  function responseError(responseVal) {
    $log.debug('Response error: ');
    $log.debug(responseVal);
    return $q.reject(responseVal);
  }

  function requiresAuth(nextRoute) {
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

  function parseResponseToken(responseHeaders) {
    let token = '';
    const TimeoutSvc = $injector.get('TimeoutSvc'); //inject here to avoid Angular dependency hell from compile and http
    for (const header in responseHeaders) {
      //$log.debug('HERE IS EACH HEADER::::::::');
      //$log.debug(header);
      if (header === 'x-auth-token' && responseHeaders[header].length > 0) { //check for the token header and make sure there's something in it
        $log.debug('Response header is:: ' + header);
        token = responseHeaders[header] ? responseHeaders[header] : '';
        $log.debug('Token in parseResponseToken is:: ' + token);
        TokenSvc.setToken(token); //add the token to localStorage, to be retrieved for the next request using getToken
        $timeout(() => {
          const isLoggedIn = UserSvc.getIsLoggedIn();
          if (isLoggedIn) {
            TimeoutSvc.setUserTimeout(); //update the app timeout
          } else {
            TimeoutSvc.cancelUserTimeout();
          }
        });
        $rootScope.$broadcast('tokenUpdate');
      }
    }
  }

}

export default angular.module(moduleName, [])
  .factory('AuthInterceptorSvc', AuthInterceptorSvc);
