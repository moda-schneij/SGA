'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:cobraComponent
 * @description
 * # CobraComponent
 * Service of the Small Group Application app
 */
 
import angular from 'angular';
import sgAppRoot from '../../../root/sgApp.component.root'; //this service is defined on the root module and injected there

class CobraComponentSvc {

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
      get: () => vm.appCtrl.appdata.cobra.cobraThirdParty || vm.appCtrl.appdata.cobra.cobraBHSElection,
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'groupRemitting', {
      get: () => vm.appCtrl.appdata.cobra.cobraThirdParty && (/group/i).test(vm.appCtrl.appdata.cobra.remittingPayment),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'tpaRemitting', {
      get: () => vm.appCtrl.appdata.cobra.cobraThirdParty && (/tpa/i).test(vm.appCtrl.appdata.cobra.remittingPayment),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'eitherRemitting', {
      get: () => vm.appCtrl.appdata.cobra.cobraThirdParty && 
        ((/tpa/i).test(vm.appCtrl.appdata.cobra.remittingPayment) || (/group/i).test(vm.appCtrl.appdata.cobra.remittingPayment)),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(vm, 'cobraEligible', {
      get: () => { 
        const cobraCount = this.UtilsSvc.isNumberOrNumString(vm.appCtrl.appdata.cobraCount) ? 
          parseInt(vm.appCtrl.appdata.cobraCount, 10) : 0;
        const cobraORMin = this.UtilsSvc.isNumberOrNumString(this.RulesSvc.rules.groupRules.cobraORMinEmployees) &&  
          this.RulesSvc.rules && this.RulesSvc.rules.groupRules && this.RulesSvc.rules.groupRules.cobraORMinEmployees ? 
          parseInt(this.RulesSvc.rules.groupRules.cobraORMinEmployees, 10) : null;
        return vm.appCtrl.groupOR ? (angular.isNumber(cobraORMin) ? 
          (cobraCount >= cobraORMin) : false) : 
          this.RulesSvc.rules.groupRules.cobraEligible;
      },
      enumerable: true,
      configurable: true
    });
  }

}

export default angular
  .module('sgAppRoot')
  .service('CobraComponentSvc', CobraComponentSvc);