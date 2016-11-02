'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:caching
 * @description
 * # Caching
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class CachingSvc {

  /*@ngInject*/
  constructor(StorageSvc, DataSvc, $q, $log, STORAGE_KEYS, $timeout) {
    this.StorageSvc = StorageSvc;
    this.DataSvc = DataSvc;
    this.$q = $q;
    this.$log = $log;
    this.STATE_KEY = STORAGE_KEYS.STATE_KEY;
    this.NAICS_KEY = STORAGE_KEYS.NAICS_KEY;
    this.$timeout = $timeout;
  }

  getStates() {
    const deferred = this.$q.defer();
    let reqTimeout;
    const states = this.StorageSvc.getSessionStore(this.STATE_KEY);

    if (!states) {
      this.$timeout(statesRequest.bind(this)); //throttle the initial call?
    } else {
      deferred.resolve(states);
    }

    //this is a dubious pattern, because i don't know that $.active (get active XHR count) is really working
    //idea is to poll active XHRs and call getStates when there are none
    //if getStates is called when there is an active request, this will result in an invalid token submission
    //in the application component, i've instead moved the call to getStates until the app object is returned from that XHR
    //so this really shouldn't be an issue
    function statesRequest() {
      if (!!$ && $.hasOwnProperty('active')) {
        if ($.active === 0) {
          this.DataSvc.getStates().then(statesSuccess.bind(this), statesFailure.bind(this));
          if (reqTimeout) {
            this.$timeout.cancel(reqTimeout.bind(this));
          }
        } else {
          reqTimeout = this.$timeout(statesRequest.bind(this), 1000);
        }
      } else {
        this.DataSvc.getStates().then(statesSuccess.bind(this), statesFailure.bind(this));
      }
    } 

    function statesSuccess(response) {
      const success = this.DataSvc.checkIsSuccess(response);
      if (success) {
        this.StorageSvc.setSessionStore(this.STATE_KEY, response.data.states);
        deferred.resolve(response.data.states);
      } else {
        statesFailure(response);
      }
    }

    function statesFailure(response) {
      this.$log.error(response);
      deferred.reject(response);
    }

    return deferred.promise;
  }

  getNAICS(code) {
    const chachedNAICSObj = this.StorageSvc.getSessionStore(this.NAICS_KEY);
    const cachedCodeMatch = chachedNAICSObj && chachedNAICSObj.code && chachedNAICSObj.code === code;
    return cachedCodeMatch ? 
      this.$q.when(chachedNAICSObj) : // return the cached NAICS obj
      this.DataSvc.getNAICSCodes(code).then((response) => { //query the API again to get the correct NAICS obj
        if (angular.isArray(response.naics) && response.naics.length > 0 && response.naics[0].hasOwnProperty('code')) {
          const naicsObj = response.naics[0];
          this.StorageSvc.setSessionStore(this.NAICS_KEY, naicsObj); //cache this returned object
          return naicsObj; //return the queried NAICS object
        }
        return; 
      });
  }

  get existingNAICS() {
    return this.StorageSvc.getSessionStore(this.NAICS_KEY);
  }

  clearNAICS() {
    this.StorageSvc.removeSessionStore(this.NAICS_KEY);
  }

}
