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
import sgAppRoot from '../../../root/sgApp.component.root';

export default angular
  .module(sgAppRoot.name)
  .component('agentSalesFormComponent', {
    templateUrl: agentSalesTemplate,
    bindings: {
      $router: '<'
    },
    require: {
      appCtrl: '^applicationComponent'
    },
    controller: AgentSalesFormCtrl
  });

/*@ngInject*/
function AgentSalesFormCtrl($log, $rootScope, SidebarSvc, OptionsSvc, DataSvc) {
  const vm = this;
  let deregisterAppDataWatch;
  const bindingObj = { vm, $log, $rootScope, SidebarSvc, OptionsSvc, DataSvc };
  //set this boolean to true by default, then check in onInit against appdata
  vm.hasAgentInfo = true;
  vm.sales = {};
  vm.displayEFTInputs = false; //this boolean is changed depending on the selection of payment type
  vm.paymentTransferDays = OptionsSvc.options.paymentTransferDays;

  vm.onSelectPaymentType = (type) => { //show eft payment inputs if eft is selected as payment type
    vm.displayEFTInputs = (/eft/i).test(type);
    if (!vm.displayEFTInputs) { //if the user has selected something other than EFT
      //wipe the EFT-specific values
      vm.appCtrl.appdata.routingNumber = 
        vm.appCtrl.appdata.accountNumber = 
        vm.appCtrl.appdata.paymentTransferDay = '';
    }
  };

  vm.$onInit = function() {
    deregisterAppDataWatch = $rootScope.$watch(function() {
      return vm.appCtrl.appdata;
    }, function(newVal) {
      if (newVal) {
        initView.call(bindingObj, vm);
        vm.appCtrl.resetPristineState();
      }
    });
    vm.appCtrl.updateAppData = function() {
      saveAppData.call(bindingObj);
    };

    DataSvc.getReps().then(
      (response) => {
        repsSuccess(response, vm);
      }, (reason) => {
        repsFailure(reason);
      });
  };

  vm.$onDestroy = function() {
    deregisterAppDataWatch();
  };
}

function repsSuccess(response, vm) {
  vm.salesRepsArray = response.data.representatives;
  //  vm.salesRepsArray.map((rep) => {
  //    rep.sales = (/sales/i).test(rep.representative) || (/both/i).test(rep.representative);
  //    rep.service = (/service/i).test(rep.representative) || (/both/i).test(rep.representative);
  //  });
}

function repsFailure(reason) {
  angular.noop();
}

function saveAppData() { //call bound to controller binding object
  this.vm.appCtrl.saveAppData(); //trigger parent controller submit updated data
}

function initView(vm) {
  vm.appCtrl.setRouteReady();
  vm.hasAgentInfo = vm.appCtrl.appdata.agentLastName && this.vm.appCtrl.appdata.agentLastName !== '';
  vm.paymentTypes = this.OptionsSvc.options.paymentVia;
  angular.forEach(this.vm.paymentTypes, (type) => {
    type.id = 'payment' + type.displayName.toLowerCase();
  });
  vm.displayEFTInputs = (/eft/i).test(this.vm.appCtrl.appdata.paymentVia);
  vm.paymentTransferDays = this.OptionsSvc.options && angular.isArray(this.OptionsSvc.options.paymentTransferDays) ? 
    this.OptionsSvc.options.paymentTransferDays : [];
}
