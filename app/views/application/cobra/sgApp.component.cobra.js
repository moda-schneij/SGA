/* jshint node: true */

'use strict';

/**
 * @ngdoc overview
 * @name cobraComponent
 * @description
 * Cobra component of the Small Group Application app.
 */

import angular from 'angular';
import cobraTemplate from './cobra.html';

export const cobraFormComponent = {
  templateUrl: cobraTemplate,
  bindings: {
    appData: '<',
    rules: '<',
    options: '<',
    statesArray: '<'
  },
  require: {
    appCtrl: '^applicationComponent'
  },
  controller: CobraFormCtrl
};

/*@ngInject*/
function CobraFormCtrl($log, CobraComponentSvc, ConstantsSvc, RulesSvc, OptionsSvc, UtilsSvc, $scope) {
  const vm = this;
  let deregisterAppDataWatch;
  let deregisterRulesWatch;
  const bindingObj = { vm, $log, ConstantsSvc, RulesSvc, $scope };
  vm.serUrl = ConstantsSvc.SER_URL;

  //hiding the selection if the user says they aren't using a TPA - need to default payer from TPA to the group
  vm.onChangeTPA = () => {
    vm.appCtrl.appData.cobra.cobraThirdParty = vm.electedTPA === 'other';
    vm.appCtrl.appData.cobra.cobraBHSElection = vm.electedTPA === 'bhs';
  };

  vm.onSelectTPA = () => {
    if (!vm.cobraThirdParty) {
      vm.appCtrl.appData.cobra.cobraThirdParty = false;
      vm.appCtrl.appData.cobra.cobraBHSElection = false;
      vm.appCtrl.appData.cobra.remittingPayment = null;
      vm.electedTPA = null;
    }
  };

  vm.remittingPayment = OptionsSvc.options.remitPayments;

  vm.$onInit = function() {
    $log.debug(vm);
    $log.debug('I am in the cobra component controller');
    refreshViewValues(vm);
    vm.appCtrl.updateAppData = function() {
      saveAppData.call(bindingObj);
    };
  };
}

function saveAppData() { //call bound to controller binding object
  this.vm.appCtrl.appData = this.appData; //copy appdata back to parent controller
  this.vm.appCtrl.saveAppData(); //trigger parent controller submit updated data
}

function refreshViewValues(vm) {
  vm.electedTPA = vm.appCtrl.appData.cobra.cobraThirdParty ? 'other' : vm.appCtrl.appData.cobra.cobraBHSElection ? 'bhs' : null;
  vm.cobraThirdParty = vm.appCtrl.appData.cobra.cobraThirdParty || vm.appCtrl.appData.cobra.cobraBHSElection;
}
