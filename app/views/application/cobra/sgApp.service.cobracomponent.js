'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:cobraComponent
 * @description
 * # CobraComponent
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class CobraComponentSvc {

  /*@ngInject*/
  constructor($log, UtilsSvc, RulesSvc, OptionsSvc) {
    this.$log = $log;
    this.UtilsSvc = UtilsSvc;
    this.RulesSvc = RulesSvc;
    this.OptionsSvc = OptionsSvc;
  }

  /*************************************
  ** Create controller computed props **
  *************************************/

  setComputedProps(vm) {
    //Computed properties
    Object.defineProperty(vm, 'tpaElected', {
      get: () => vm.appCtrl.appData.cobra.cobraThirdParty || vm.appCtrl.appData.cobra.cobraBHSElection,
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'groupRemitting', {
      get: () => vm.appCtrl.appData.cobra.cobraThirdParty && (/group/i).test(vm.appCtrl.appData.cobra.remittingPayment),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'tpaRemitting', {
      get: () => vm.appCtrl.appData.cobra.cobraThirdParty && (/tpa/i).test(vm.appCtrl.appData.cobra.remittingPayment),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'eitherRemitting', {
      get: () => vm.appCtrl.appData.cobra.cobraThirdParty &&
        ((/tpa/i).test(vm.appCtrl.appData.cobra.remittingPayment) || (/group/i).test(vm.appCtrl.appData.cobra.remittingPayment)),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'cobraEligible', {
      get: () => {
        const cobraCount = this.UtilsSvc.isNumberOrNumString(vm.appCtrl.appData.cobraCount) ?
          parseInt(vm.appCtrl.appData.cobraCount, 10) : 0;
        const cobraORMin = this.UtilsSvc.isNumberOrNumString(this.RulesSvc.rules.groupRules.cobraORMinEmployees) &&
          this.RulesSvc.rules && this.RulesSvc.rules.groupRules && this.RulesSvc.rules.groupRules.cobraORMinEmployees ?
          parseInt(this.RulesSvc.rules.groupRules.cobraORMinEmployees, 10) : null;
        //logic comment
        //if group is OR *or* AK with effDate after 2016, then ...
        //if there's a min number set for OR Cobra elig, return true only if empl count is GTE that minimum, otherwise false ...
        //otherwise the value of cobraEligible from the rules object
        return (vm.appCtrl.groupOR || (vm.appCtrl.groupAK && !(/2016/).test(vm.appCtrl.effDate.getFullYear()))) ? (angular.isNumber(cobraORMin) ?
          (cobraCount >= cobraORMin) : false) :
          this.RulesSvc.rules.groupRules.cobraEligible;
      },
      enumerable: true,
      configurable: true
    });
  }

}
