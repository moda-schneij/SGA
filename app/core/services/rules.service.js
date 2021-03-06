'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:rules
 * @description
 * # Rules
 * Service of the Small Group Application app
 */

import angular from 'angular';
//DUMMYING in RULES object: TODO - remove when implemented
const mockRulesObj = require('json!../json/rules.json');
//DUMMYING in RULES object: TODO - remove when implemented

export default class RulesSvc {

  /*@ngInject*/
  constructor(StorageSvc, $log, $q, $interval, STORAGE_KEYS) {
    this.StorageSvc = StorageSvc;
    this.$log = $log;
    this.$q = $q;
    this.$interval = $interval;
    this.RULES_KEY = STORAGE_KEYS.RULES_KEY;
  }

  get rules() {
    return this.StorageSvc.getSessionStore(this.RULES_KEY) ? this.StorageSvc.getSessionStore(this.RULES_KEY) : {};
  }

  get rulesAsync() {
    const {$q, $interval, StorageSvc, RULES_KEY} = this;
    return $q((resolve, reject) => {
      const returnRules = $interval(() => {
        const rules = StorageSvc.getSessionStore(RULES_KEY);
        if (rules) {
          resolve(rules);
          $interval.cancel(returnRules);
        } 
      }, 50, 10); //interval in ms, repeat value
    });
  }

  //the setter should only be called by the application service on loading the payload
  set rules(rulesObj) {
    //TODO - this should be the real implementation
    // if (!this.ruleSet) { //the ruleset should be undefined before it's set in client storage
    //   this.StorageSvc.setSessionStore(this.RULES_KEY, rulesObj);
    // }
    //TODO
    //FAKE
    if (!this.StorageSvc.getSessionStore(this.RULES_KEY)) { //the ruleset should be undefined before it's set in client storage
      const mergedRules = angular.merge({}, rulesObj, mockRulesObj);
      this.StorageSvc.setSessionStore(this.RULES_KEY, mergedRules);
    }
    //FAKE
  }
}
