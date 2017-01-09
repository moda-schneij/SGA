'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:options
 * @description
 * # Options
 * Service of the Small Group Application app
 * For setting options in select boxes and such
 */

import angular from 'angular';
//DUMMYING in extra options object: TODO - remove when implemented
const mockOptionsObj = require('json!../json/options.json');
//DUMMYING in extra options object: TODO - remove when implemented

export default class OptionsSvc {

  /*@ngInject*/
  constructor(StorageSvc, $log, $q, $interval, STORAGE_KEYS) {
    this.StorageSvc = StorageSvc;
    this.$log = $log;
    this.$q = $q;
    this.$interval = $interval;
    this.OPTIONS_KEY = STORAGE_KEYS.OPTIONS_KEY;
  }

  get options () {
    return this.StorageSvc.getSessionStore(this.OPTIONS_KEY);
  }

  get optionsAsync() {
    const {$q, $interval, StorageSvc, OPTIONS_KEY} = this;
    return $q((resolve, reject) => {
      const returnOptions = $interval(() => {
        const options = StorageSvc.getSessionStore(OPTIONS_KEY);
        if (options) {
          resolve(options);
          $interval.cancel(returnOptions);
        } 
      }, 50, 10); //interval in ms, repeat value
    });
  }

  set options (optionsObj) {
    //DUMMYING in extra options object: TODO - remove when implemented
    const mergedOptions = angular.merge({}, optionsObj, mockOptionsObj);
    this.StorageSvc.setSessionStore(this.OPTIONS_KEY, mergedOptions);
    //DUMMYING in extra options object: TODO - remove when implemented
  }

}
