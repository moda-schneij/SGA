/* jshint node: true */

'use strict';

/**
 * @ngdoc overview
 * @name applicationComponent
 * @description
 * Application component of the Small Group Application app.
 */

import angular from 'angular';
import applicationTemplate from './application.html';

const routeConfig = require('json!./routes.json');

export const applicationComponent = {
  templateUrl: applicationTemplate,
  bindings: {
    appData: '<',
    rules: '<',
    options: '<',
    statesArray: '<',
    appId: '<',
    quoteId: '<',
    setRouteReady: '&'
  },
  require: {
    rootCtrl: '^sgaRoot'
  },
  controller: ApplicationCtrl,
  $routeConfig: routeConfig
};

/*@ngInject*/
function ApplicationCtrl($state, $transitions, SpinnerControlSvc, AuthenticationSvc, DataSvc, $log, ApplicationComponentSvc, UtilsSvc, ConstantsSvc, ApplicationSvc, CachingSvc, RulesSvc, OptionsSvc, MessagesSvc, $rootRouter, $rootScope, $window, $timeout, $scope) {
  const vm = this;
  const args = Array.prototype.slice.call(arguments);
  $log.debug('THE ARGS ARRAY');
  $log.debug(args);
  const bindingObj = {
    vm,
    $state,
    $transitions,
    SpinnerControlSvc,
    AuthenticationSvc,
    DataSvc,
    $log,
    ApplicationComponentSvc,
    UtilsSvc,
    ConstantsSvc,
    ApplicationSvc,
    RulesSvc,
    OptionsSvc,
    MessagesSvc,
    $rootRouter,
    $rootScope,
    $window,
    $timeout,
    $scope
  };

  let deregisterDataWatch;
  //let deregisterAppCtrlDataWatch;
  let deregisterConfigWatch;

  // //attempt to use ui-router 
  // $transitions.onSuccess({}, () => {
  //   ApplicationComponentSvc.configNav(vm); //set up nav buttons
  //   vm.navigating = false;
  // });

  // const deregisterRouterWatch = $rootScope.$watch(function() {
  //   return vm.$router.currentInstruction;
  // }, function(newVal) {
  //   ApplicationComponentSvc.configNav(vm); //set up nav buttons
  // });

  vm.navigating = false; //toggled during navigate method and on $routeChangeSuccess
  vm.serUrl = ConstantsSvc.SER_URL;
  vm.submitView = false;
  vm.confirmEnroll = false; //to be toggled when the application is in status "C" to enable enroll

  //these view-specific values will be reset after appData is delivered
  vm.denExceedsMed = false;
  vm.denOnlyEmployees = '';
  vm.groupName = '';
  vm.hasMedDependents = false;
  vm.hasDenDependents = false;
  vm.allowSubmit = false;

  //initial nav states
  vm.hasNextRoute = true;
  vm.hasPrevRoute = false;

  //update submit status
  vm.setEnableSubmit = () => {
    vm.allowSubmit = true;
  };

  vm.getNextStep = () => {
    $log.debug('next step is: ' + ApplicationComponentSvc.getNextStep(vm));
    return ApplicationComponentSvc.getNextStep(vm);
  };

  //NAVIGATION actions

  //ORIGINAL//
  vm.next = () => {
    if ((vm.applicationform.$pristine && !vm.applicationform.modified && vm.applicationform.$valid) || !vm.inProgressApp) {
      ApplicationComponentSvc.navigate(vm, {
        direction: 'forward'
      });
    } else {
      vm.saveAppData({next: true});
    }
  };
  //ORIGINAL//

  //TEMPORARY//
  // vm.next = function() {
  //   ApplicationComponentSvc.navigate(vm, {
  //     direction: 'forward'
  //   });
  // };
  //TEMPORARY//

  vm.prev = () => {
    ApplicationSvc.restoreApplication().then((response) => { //always reset app data going back without a save
      if (response && UtilsSvc.notNullOrEmptyObj(response)) {
        vm.appData = response; //reset appData
      }
      ApplicationComponentSvc.navigate(vm, {
        direction: 'back'
      });
    });

    // had implemented backward save, but think this is bad UX - need to leave back button enabled generally
    // if ((vm.applicationform.$pristine && vm.applicationform.$valid) || !vm.inProgressApp) {
    //   ApplicationComponentSvc.navigate(vm, {
    //     direction: 'back'
    //   });
    // } else { //wipe out changes that aren't saved, then navigate
    //   vm.saveAppData({prev: true});
    // }
  };

  //END NAVIGATION actions

  //persistence actions
  vm.saveAppData = (actionObj) => {
    $log.debug('save was called from child');
    $log.debug(vm.appData);
    if (actionObj && actionObj.next) {
      const nextOrder = vm.$router.currentInstruction.component.routeData.data.order;
      const hasNextRoute = routeConfig[nextOrder];
      if (hasNextRoute) {
        //the next route's name is defined by the order of the current route (the order is one behind)
        const nextRouteName = routeConfig[vm.$router.currentInstruction.component.routeData.data.order].name;
        //TODO - testing save without setting the route name for coming back
        ApplicationComponentSvc.updateProgress(vm, nextRouteName);
      }
    } else if (actionObj && actionObj.prev) {
      const prevOrder = vm.$router.currentInstruction.component.routeData.data.order - 2;
      const hasPrevRoute = routeConfig[prevOrder];
      if (hasPrevRoute) {
        //the next route's name is defined by the order of the current route (the order is one behind)
        const prevRouteName = routeConfig[(vm.$router.currentInstruction.component.routeData.data.order - 2)].name;
        //TODO - testing save without setting the route name for coming back
        ApplicationComponentSvc.updateProgress(vm, prevRouteName);
      }
    } else {
      //this represents the current view, where the order is one ahead of current
      const thisRouteName = routeConfig[vm.$router.currentInstruction.component.routeData.data.order - 1].name;
      ApplicationComponentSvc.updateProgress(vm, thisRouteName);
    }
    DataSvc.application.save(vm.appData).then((response) => {
      ApplicationComponentSvc.dataSaved(response, vm, actionObj);
    }, (error) => {
      ApplicationComponentSvc.dataNotSaved(error, vm);
    });
  };

  vm.submitApp = () => {
    //TODO - Implement wrapper on callbacks for submit confirmation, etc)
    SpinnerControlSvc.startSpin({overlay: true});
    DataSvc.application.submit(vm.appData)
      .then((response) => {
        ApplicationComponentSvc.dataSaved(response, vm, {
          next: false,
          enroll: true
        });
      }, (error) => {
        ApplicationComponentSvc.dataNotSaved(error, vm);
      })
      .finally(() => {
        SpinnerControlSvc.stopSpin()
      });
  };

  vm.enrollApp = () => {
    ApplicationComponentSvc.enroll(vm);
  };

  vm.updateValidity = (value, bool) => {
    $log.debug(vm);
    vm.applicationform.$setValidity(value, bool);
  };

  // vm.setRouteReady = () => { //this is called from nested routes (or should be)
  //   vm.rootCtrl.setRouteReady();
  // };

  vm.resetPristineState = () => {
    ApplicationComponentSvc.resetPristineState(vm);
  };

  vm.$onInit = () => {
    $log.debug(vm);
    $log.debug('APPLICATIONCOMPONENT.$onInit');
    //these values were set on the root component, which grabbed them from the URL query string
    //set application component controller appData object (if it doesn't already exist) from root component
    ApplicationComponentSvc.setRulesAndOptions(vm);
    ApplicationComponentSvc.updateViewValues(vm); //static props
    ApplicationComponentSvc.setComputedProps(vm); //dynamic props, after static
    // ApplicationComponentSvc.configNav(vm); //set up nav buttons
    // ApplicationComponentSvc.returnToLastStep(vm);
    // vm.navigating = false;
  
    // CachingSvc.getStates()
    //   .then((states) => {
    //     if (angular.isArray(states)) {
    //       vm.statesArray = states;
    //     }
    //   }, (error) => {
    //     $log.error('No states were returned');
    //     $log.error(error);
    //   })
    //   .finally(() => {
    //     ApplicationComponentSvc.updateViewValues(vm); //static props
    //     ApplicationComponentSvc.setComputedProps(vm); //dynamic props, after static
    //     ApplicationComponentSvc.configNav(vm); //set up nav buttons
    //     ApplicationComponentSvc.returnToLastStep(vm);
    //     vm.navigating = false;
    //   });
  };

  vm.$postLink = () => {
    $log.debug('APPLICATIONCOMPONENT.$postLink');
    ApplicationComponentSvc.configNav(vm); //set up nav buttons
    ApplicationComponentSvc.returnToLastStep(vm);
    vm.navigating = false;
    // $timeout(() => {
    //   ApplicationComponentSvc.setRulesAndOptions(vm);
    //   ApplicationComponentSvc.updateViewValues(vm); //static props
    //   ApplicationComponentSvc.setComputedProps(vm); //dynamic props, after static
    //   ApplicationComponentSvc.configNav(vm); //set up nav buttons
    //   ApplicationComponentSvc.returnToLastStep(vm);
    //   vm.navigating = false;
    // }, 100);
    // ApplicationComponentSvc.setRulesAndOptions(vm);
    // ApplicationComponentSvc.updateViewValues(vm); //static props
    // ApplicationComponentSvc.setComputedProps(vm); //dynamic props, after static
    // ApplicationComponentSvc.configNav(vm); //set up nav buttons
    // ApplicationComponentSvc.returnToLastStep(vm);
    // vm.navigating = false;
  };

  // //copy data back to root controller if it changes in the app component
  // deregisterAppCtrlDataWatch = $rootScope.$watchCollection(() => vm.appData,
  // (newVal) => {
  //   if (newVal) {
  //     vm.rootCtrl.appdata = vm.appdata;
  //   }
  // });

  vm.$onDestroy = () => {
    //deregisterAppCtrlDataWatch();
    if (angular.isFunction(deregisterConfigWatch)) {
      deregisterConfigWatch();
    }
  };

}