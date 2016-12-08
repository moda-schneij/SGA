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
let forward = false;

export const cobraFormComponent = {
  templateUrl: cobraTemplate,
  bindings: {
    $router: '<'
  },
  require: {
    appCtrl: '^applicationComponent'
  },
  controller: CobraFormCtrl,
  $canActivate: canActivateFn
};

/*@ngInject*/
function canActivateFn($nextInstruction, $prevInstruction, UserSvc) {
  
  /* See $onInit for implementation of routing for cobra eligible or ineligible */
  /* crappy implementation of avoiding COBRA route - may be possible to refactor to use a navigation
  ** service, but because I don't have access to the application controller here (I do inside the controller), I cannot call
  ** to navigate away from the cobra view until I can call next() or prev() on the application controller,
  ** which effectively skips over this view and otherwise retains order */
  
  const cobraOrder = $nextInstruction && $nextInstruction.routeData.data.order;
  const lastOrder = $prevInstruction && $prevInstruction.routeData.data.order;
  if (lastOrder && cobraOrder && lastOrder !== cobraOrder) {
    forward = lastOrder < cobraOrder; //just determining here whether we're going forward or backward
    //based on this value, if the group isn't cobra-eligible, we'll skip forward or backward
    //see inside controller $onInit
  }
  return UserSvc.getIsLoggedIn();
}


/*@ngInject*/
function CobraFormCtrl($log, CobraComponentSvc, ConstantsSvc, RulesSvc, OptionsSvc, UtilsSvc, $rootRouter, $scope) {
  const vm = this;
  let deregisterAppDataWatch;
  let deregisterRulesWatch;
  const bindingObj = { vm, $log, ConstantsSvc, RulesSvc, $rootRouter, $scope };
  vm.serUrl = ConstantsSvc.SER_URL;
  vm.quoteId = $rootRouter.currentInstruction.component.routeData.data.quoteId;

  //hiding the selection if the user says they aren't using a TPA - need to default payer from TPA to the group
  vm.onChangeTPA = () => {
    vm.appCtrl.appdata.cobra.cobraThirdParty = vm.electedTPA === 'other';
    vm.appCtrl.appdata.cobra.cobraBHSElection = vm.electedTPA === 'bhs';
  };

  vm.onSelectTPA = () => {
    if (!vm.cobraThirdParty) {
      vm.appCtrl.appdata.cobra.cobraThirdParty = false;
      vm.appCtrl.appdata.cobra.cobraBHSElection = false;
      vm.appCtrl.appdata.cobra.remittingPayment = null;
      vm.electedTPA = null;
    }
  };

  vm.remittingPayment = OptionsSvc.options.remitPayments;

  vm.$onInit = function() {
    $log.debug(vm);
    $log.debug('I am in the cobra component controller'); 
    deregisterAppDataWatch = $scope.$watch(
      () => vm.appCtrl.appdata, 
      (newAppDataVal) => {
      if (UtilsSvc.notNullOrEmptyObj(newAppDataVal)) {
        deregisterRulesWatch = $scope.$watch(
          () => RulesSvc.rules,
          (newRulesVal) => {
            if (UtilsSvc.notNullOrEmptyObj(newRulesVal)) {
              deregisterRulesWatch();
              CobraComponentSvc.setComputedProps(vm);
              if (!vm.cobraEligible) { //check to see if this group is cobra eligible, and if not...
                if (forward) { //check the value of forward, set in the CanActivateFn
                  vm.appCtrl.next(); //if it has been flipped to true, navigate away forward
                } else {
                  vm.appCtrl.prev(); //otherwise, navigate away backward
                }
              } else { //otherwise, continue to load data into the cobra view and display
                if (!vm.appdata) {
                  vm.appdata = vm.appCtrl.appdata;
                  refreshViewValues(vm);
                  vm.appCtrl.setRouteReady();
                }
              }
            }
          }
        );
        vm.appCtrl.resetPristineState();
      }
    });

    vm.appCtrl.updateAppData = function() {
      saveAppData.call(bindingObj);
    };
  };

  vm.$onDestroy = function() {
    deregisterAppDataWatch();
  };
}

function saveAppData() { //call bound to controller binding object
  this.vm.appCtrl.appdata = this.vm.appdata; //copy appdata back to parent controller
  this.vm.appCtrl.saveAppData(); //trigger parent controller submit updated data
}

function refreshViewValues(vm) {
  vm.electedTPA = vm.appCtrl.appdata.cobra.cobraThirdParty ? 'other' : vm.appCtrl.appdata.cobra.cobraBHSElection ? 'bhs' : null;
  vm.cobraThirdParty = vm.appCtrl.appdata.cobra.cobraThirdParty || vm.appCtrl.appdata.cobra.cobraBHSElection;
}