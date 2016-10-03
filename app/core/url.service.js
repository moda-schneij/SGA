'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:url
 * @description
 * # URL
 * Service of the Small Group Application app
 */

import angular from 'angular';
const moduleName = 'sgAppUrlSvc';

class UrlSvc {

  /*@ngInject*/
  constructor($location, $log) {
    this.$location = $location;
    this.$log = $log;
  }

  getQueryString() {
    const url = this.$location.absUrl();
    const queryRegex = /\?[^\/]*/;
    const queryMatch = url.match(queryRegex);
    const queryString = queryMatch ? queryMatch[0].slice(1) : null;
    return queryString;
  }

  getQueryObj() {
    const queryString = this.getQueryString();
    const queryArr = queryString && queryString.length >= 3 ? queryString.split('&') : [];
    const queryObj = {};
    angular.forEach(queryArr, function(value, key) {
      const objPairArr = value.split('='); //this makes a 2 member array of key -> value
      queryObj[objPairArr[0]] = objPairArr[1];
    });
    return queryObj;
  }

  getQuoteIdFromUrl() {
    const queryObj = this.getQueryObj();
    const quoteId = queryObj['quoteId'];
    this.$log.debug('quoteId: ' + quoteId);
    if (quoteId) {
      return quoteId;
    }
  }

  getAppIdFromUrl() {
    const queryObj = this.getQueryObj();
    const appId = queryObj['appId'];
    this.$log.debug('appId: ' + appId);
    if (appId) {
      return appId;
    }
  }

  getEINFromUrl() {
    const queryObj = this.getQueryObj();
    const ein = queryObj['ein'];
    this.$log.debug('ein: ' + ein);
    if (ein) {
      return ein;
    }
  }

  stripQueryString() {
    const queryString = this.getQueryString();
    const url = this.$location.absUrl();
    const protocol = this.$location.protocol() + '://';
    const protocolLen = protocol.length;
    const urlNoProtocol = url.substring(protocolLen);
    let returnUrl = queryString ? urlNoProtocol.replace(queryString, '/') : urlNoProtocol;
    returnUrl = queryString ? returnUrl.replace(/[?,&]/g, '') : returnUrl;
    while (returnUrl.indexOf('//') > -1) { //strip out extra slashes
      returnUrl = returnUrl.replace('//', '/');
    }
    return protocol + returnUrl;
  }

}

export default angular
  .module(moduleName, [])
  .service('UrlSvc', UrlSvc);
