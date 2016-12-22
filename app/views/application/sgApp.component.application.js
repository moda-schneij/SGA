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

export const applicationComponent = {
  templateUrl: applicationTemplate,
  bindings: {
    appData: '<',
    rules: '<',
    options: '<',
    statesArray: '<'
  },
  require: {
    rootCtrl: '^sgaRoot'
  },
  controller: ApplicationCtrl
};

/*@ngInject*/
function ApplicationCtrl($state, $transitions, SpinnerControlSvc, AuthenticationSvc, DataSvc, $log, ApplicationComponentSvc, UtilsSvc, ConstantsSvc, ApplicationSvc, NavigationSvc, CachingSvc, RulesSvc, OptionsSvc, MessagesSvc, $rootRouter, $rootScope, $window, $timeout, $interval, $scope) {
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
    NavigationSvc,
    RulesSvc,
    OptionsSvc,
    MessagesSvc,
    $rootRouter,
    $rootScope,
    $window,
    $timeout,
    $interval,
    $scope
  };

  //let deregisterDataWatch;
  //let deregisterAppCtrlDataWatch;
  //let deregisterConfigWatch;

  // //attempt to use ui-router
  $transitions.onSuccess({}, () => {
    ApplicationComponentSvc.configNav(vm); //set up nav buttons
    $timeout(() => {
      ApplicationComponentSvc.resetPristineState(vm.applicationform);
    }, 200);
    vm.navigating = false;
    $log.error('TRANSITIONS SUCCESS, here\'s the application form', vm.applicationform);
  });

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
    $log.debug('next step is: ' + NavigationSvc.getNextStep());
    return NavigationSvc.getNextStep();
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
    const appRouteEntries = $state.get().filter((state) =>
      state.parent && state.parent === 'ApplicationView');
    const thisOrder = $state.current.data.order;
    if (actionObj && actionObj.next) {
      const nextOrder = thisOrder + 1;
      const nextRoute = appRouteEntries.filter((route) => route.data && route.data.order &&
        route.data.order === nextOrder)[0];
      const hasNextRoute = Boolean(nextRoute);
      if (hasNextRoute) {
        //the next route's name is defined by the order of the current route (the order is one behind)
        const nextRouteName = nextRoute.name;
        //TODO - testing save without setting the route name for coming back
        ApplicationComponentSvc.updateProgress(vm, nextRouteName);
      }
    } else if (actionObj && actionObj.prev) {
      const prevOrder = thisOrder - 1;
      const prevRoute = appRouteEntries.filter((route) => route.data && route.data.order &&
       route.data.order === prevOrder)[0];
      const hasPrevRoute = Boolean(prevRoute);
      if (hasPrevRoute) {
        //the next route's name is defined by the order of the current route (the order is one behind)
        const prevRouteName = prevRoute.name;
        //TODO - testing save without setting the route name for coming back
        ApplicationComponentSvc.updateProgress(vm, prevRouteName);
      }
    } else {
      //this represents the current view, where the order is one ahead of current
      const thisRouteName = appRouteEntries.filter((route) => route.data && route.data.order &&
        route.data.order === thisOrder)[0].name;
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

  vm.resetPristineState = () => {
    $rootScope.$evalAsync(() => {
      ApplicationComponentSvc.resetPristineState(vm.applicationform);
    });
  };

  vm.$onInit = () => {
    $rootScope.$evalAsync(() => {
      $log.debug(vm);
      $log.debug('APPLICATIONCOMPONENT.$onInit');
      $log.debug('appformctrl', vm.applicationform);
      //these values were set on the root component, which grabbed them from the URL query string
      //set application component controller appData object (if it doesn't already exist) from root component
      ApplicationComponentSvc.setRulesAndOptions(vm);
      ApplicationComponentSvc.updateViewValues(vm); //static props
      ApplicationComponentSvc.setComputedProps(vm); //dynamic props, after static
      ApplicationComponentSvc.configNav(vm); //set up nav buttons
      NavigationSvc.returnToLastStep();
      vm.navigating = false;
    });
  };

}
