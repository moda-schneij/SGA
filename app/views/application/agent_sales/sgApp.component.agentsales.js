/* jshint node: true */

'use strict';

/**
 * @ngdoc overview
 * @name agentSalesComponent
 * @description
 * Agent-Sales component of the Small Group Application app.
 */

import angular from 'angular';
import agentSalesTemplate from './agent_sales.html';

export const agentSalesFormComponent = {
  templateUrl: agentSalesTemplate,
  bindings: {
    appData: '<',
    rules: '<',
    options: '<',
    statesArray: '<',
    salesRepsArray: '<'
  },
  require: {
    appCtrl: '^applicationComponent'
  },
  controller: AgentSalesFormCtrl
};

/*@ngInject*/
function AgentSalesFormCtrl($log, $rootScope, SidebarSvc, OptionsSvc, DataSvc) {
  const vm = this;
  let deregisterAppDataWatch;
  const bindingObj = { vm, $log, $rootScope, SidebarSvc, OptionsSvc, DataSvc };
  //set this boolean to true by default, then check in onInit against appData
  vm.hasAgentInfo = true;
  vm.sales = {};
  vm.displayEFTInputs = false; //this boolean is changed depending on the selection of payment type
  vm.paymentTransferDays = OptionsSvc.options.paymentTransferDays;

  vm.onSelectPaymentType = (type) => { //show eft payment inputs if eft is selected as payment type
    vm.displayEFTInputs = (/eft/i).test(type);
    if (!vm.displayEFTInputs) { //if the user has selected something other than EFT
      //wipe the EFT-specific values
      vm.appCtrl.appData.routingNumber =
        vm.appCtrl.appData.accountNumber =
        vm.appCtrl.appData.paymentTransferDay = '';
    }
  };

  vm.$onInit = function() {
    initView.call(bindingObj, vm);
    vm.appCtrl.resetPristineState();
    vm.appCtrl.updateAppData = function() {
      saveAppData.call(bindingObj);
    };
  };
}

function saveAppData() { //call bound to controller binding object
  this.vm.appCtrl.saveAppData(); //trigger parent controller submit updated data
}

function initView(vm) {
  vm.hasAgentInfo = vm.appCtrl.appData.agentLastName && this.vm.appCtrl.appData.agentLastName !== '';
  vm.paymentTypes = this.OptionsSvc.options.paymentVia;
  angular.forEach(this.vm.paymentTypes, (type) => {
    type.id = 'payment' + type.displayName.toLowerCase();
  });
  vm.displayEFTInputs = (/eft/i).test(this.vm.appCtrl.appData.paymentVia);
  vm.paymentTransferDays = this.OptionsSvc.options && angular.isArray(this.OptionsSvc.options.paymentTransferDays) ?
    this.OptionsSvc.options.paymentTransferDays : [];
}
