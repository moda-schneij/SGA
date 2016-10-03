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
const moduleName = 'sgAppOptionsSvc';
//DUMMYING in extra options object: TODO - remove when implemented
const mockOptionsObj = require('json!./mockOptions.json');
//DUMMYING in extra options object: TODO - remove when implemented

class OptionsSvc {

  /*@ngInject*/
  constructor(StorageSvc, $log, STORAGE_KEYS) {
    this.StorageSvc = StorageSvc;
    this.$log = $log;
    this.OPTIONS_KEY = STORAGE_KEYS.OPTIONS_KEY;
  }

  get options () {
    return this.StorageSvc.getSessionStore(this.OPTIONS_KEY);
  }

  set options (optionsObj) {
    //DUMMYING in extra options object: TODO - remove when implemented
    const mergedOptions = angular.merge({}, optionsObj, mockOptionsObj);
    this.StorageSvc.setSessionStore(this.OPTIONS_KEY, mergedOptions);
    //DUMMYING in extra options object: TODO - remove when implemented
  }

}

export default angular
  .module(moduleName, [])
  .service('OptionsSvc', OptionsSvc);
