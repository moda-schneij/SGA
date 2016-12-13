'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:applicationComponent
 * @description
 * # ApplicationComponent
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class ApplicationComponentSvc {

  /*@ngInject*/
  constructor($log, $state, $timeout, SpinnerControlSvc, UtilsSvc, DialogSvc, DataSvc, REGEXS, toArrayFilter, RulesSvc, OptionsSvc, ApplicationSvc, MessagesSvc, SGA_CLIENT_KEYS) {
    this.$log = $log;
    this.$state = $state;
    this.appRouteEntries = $state.get().filter((state) =>
      state.parent && state.parent === 'ApplicationView');
    this.$timeout = $timeout;
    this.SpinnerControlSvc = SpinnerControlSvc;
    this.UtilsSvc = UtilsSvc;
    this.DialogSvc = DialogSvc;
    this.DataSvc = DataSvc;
    this.REGEXS = REGEXS;
    this.toArrayFilter = toArrayFilter;
    this.RulesSvc = RulesSvc;
    this.OptionsSvc = OptionsSvc;
    this.ApplicationSvc = ApplicationSvc;
    this.MessagesSvc = MessagesSvc;
    this.configNav = this.configNav.bind(this);
    this.dataNotSaved = this.dataNotSaved.bind(this);
    this.navigate = this.navigate.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.PROGRESS_KEY = SGA_CLIENT_KEYS.progress;
    this.enroll = this.enroll.bind(this);
    this.setComputedProps = this.setComputedProps.bind(this);
  }

  /*************************************
  ** Create controller computed props **
  *************************************/

  setComputedProps(vm) {
    //computed properties
    const re = this.REGEXS;
    const utils = this.UtilsSvc;

    Object.defineProperty(vm, 'enableSubmit', {
      get: () => !vm.applicationform.$invalid &&
        vm.appData &&
        vm.appData.appStatus === 'P' &&
        ((!vm.applicationform.$pristine && vm.applicationform.modified) || vm.allowSubmit),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'inProgressApp', {
      get: () => vm.appData &&
        vm.appData.appStatus === 'P',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'completedApp', {
      get: () => vm.appData &&
        vm.appData.appStatus === 'C',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'failedApp', {
      get: () => vm.appData &&
        vm.appData.appStatus === 'F',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'enrolledApp', {
      get: () => vm.appData &&
        vm.appData.appStatus === 'S',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'disallowFutureDependents', {
      get: () => ({
        dental: !vm.hasDenDependents && vm.appData.employeeOnlyPlan.dental,
        medical: !vm.hasMedDependents && vm.appData.employeeOnlyPlan.medical
      }),
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'enableDependentInputs', {
      get: () => ({
        dental: vm.hasDenDependents || !vm.appData.employeeOnlyPlan.dental,
        medical: vm.hasMedDependents || !vm.appData.employeeOnlyPlan.medical
      }),
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'employeeOnlyApp', {
      get: () => vm.appData.employeeOnlyPlan.medical &&
        vm.appData.employeeOnlyPlan.dental,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'anyPlanSelected', {
      get: () => ({
        dental: vm.appData.groupPlan.categories.dental.plans.filter((plan) => plan.selected).length > 0,
        medical: vm.appData.groupPlan.categories.medical.plans.filter((plan) => plan.selected).length > 0
      }),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'employeeOnlyForSelectedLines', {
      get: () => (vm.appData.employeeOnlyPlan.medical && vm.appData.employeeOnlyPlan.dental) ||
        (vm.appData.employeeOnlyPlan.medical && (!vm.hasDental || !vm.anyPlanSelected.dental)) ||
        (vm.appData.employeeOnlyPlan.dental && (!vm.hasMedical || !vm.anyPlanSelected.medical)),
      enumerable: true,
      configurable: true
    });

  }

  resetPristineState(formCtrl) {
    this.$log.error('THE APPLICATION FORM', formCtrl);
    if (formCtrl && angular.isFunction(formCtrl.$setPristine)) {
      formCtrl.$setPristine();
    }
    if (formCtrl.modifiedChildFormsCount > 1) {
      formCtrl.modifiedChildForms.forEach((ctrl) => {
        if (angular.isFunction(ctrl.$setPristine)) {
          ctrl.$setPristine();
        }
      });
    }
  }

  setRulesAndOptions(vm) {
    //vm.rules = this.RulesSvc.rules;
    //vm.options = this.OptionsSvc.options;
    vm.addressRules = vm.rules.addressRules;
    vm.contactRules = vm.rules.contactRules;
    vm.groupRules = vm.rules.groupRules;
    vm.groupPlanRules = vm.rules.groupPlanRules;
    //add a string for ng-pattern for zip codes (TODO - add others)
    vm.addressRules.zip.pattern = '\\d{' + vm.addressRules.zip.minLength + ',' + vm.addressRules.zip.maxLength + '}';
  }

  //set *static* values for the view after appData is loaded in onInit
  updateViewValues(vm) {
    const appData = vm.appData;
    const medEnrollments = appData.groupPlan.categories.medical.enrollments;
    const denEnrollments = appData.groupPlan.categories.dental.enrollments;
    vm.groupOR = vm.appData.group.clientState === 'OR';
    vm.groupAK = vm.appData.group.clientState === 'AK';
    vm.effDate = new Date(vm.appData.effectiveDate);
    vm.denExceedsMed = appData.totalEmpAndCobraMedEnrolling < appData.totalEmpAndCobraDenEnrolling;
    vm.denOnlyEmployees = appData.totalEmpAndCobraDenEnrolling - appData.totalEmpAndCobraMedEnrolling;
    vm.groupName = this.UtilsSvc.notNullOrEmpty(appData.group.facetsOutputName) ?
      appData.group.facetsOutputName : this.UtilsSvc.notNullOrEmpty(appData.group.employerLegalName) ?
      appData.group.employerLegalName : 'this group';
    vm.hasMedDependents = (medEnrollments.ecCount + medEnrollments.esCount + medEnrollments.efCount) > 0;
    vm.hasDenDependents = (denEnrollments.ecCount + denEnrollments.esCount + denEnrollments.efCount) > 0;
    vm.medTotalEnrollment = Object.keys(medEnrollments).reduce((prevVal, key) => (prevVal + medEnrollments[key]), 0);
    vm.hasMedical = vm.medTotalEnrollment > 0;
    vm.denTotalEnrollment = Object.keys(denEnrollments).reduce((prevVal, key) => (prevVal + denEnrollments[key]), 0);
    vm.hasDental = vm.denTotalEnrollment > 0;
    vm.showEmployeeOnlySelection = (vm.hasMedical && !vm.hasMedDependents) ||
      (vm.hasDental && !vm.hasDenDependents);
  }

  //persistence of client progress
  updateProgress(vm, nextRouteName) {
    //this should run only if sgaClient is null, as it is before any modification
    const sgaClientValToSet = vm.appData.sgaClient ? angular.fromJson(vm.appData.sgaClient) : {};
    sgaClientValToSet[this.PROGRESS_KEY] = nextRouteName;
    vm.appData.sgaClient = angular.toJson(sgaClientValToSet);
  }

  //retrive the name of the next step to continue with
  getNextStep() {
    const appData = this.ApplicationSvc.getApplication();
    if (!appData) {
      return null;
    }
    const {$state} = this;
    const dummyState = {data: {order: -1}};
    const finalAppRoute = this.appRouteEntries.reduce((prevVal, currVal) => {
      if (prevVal.data && prevVal.data.order && currVal.data && currVal.data.order) {
        return (currVal.data.order > prevVal.data.order) ? currVal : prevVal;
      }
      return dummyState;
    }, dummyState);
    const finalAppRouteName = finalAppRoute && finalAppRoute.name ? finalAppRoute.name : null;
    const sgaClientVal = appData.sgaClient ? angular.fromJson(appData.sgaClient) : {};
    //if this is an in-progress app, go back to last completed or saved step, otherwise to the end of the application form
    return appData.appStatus === 'P' ? sgaClientVal[this.PROGRESS_KEY] : angular.isString(finalAppRouteName) ?
      finalAppRouteName : null; //should be a route name as a string or undefined
  }

  returnToLastStep() {
    const {$state} = this;
    const routeName = this.getNextStep()
    $state.go(routeName);
  }

  //navigation methods
  configNav(vm) {
    const {$state} = this;
    const nextRouteId = $state.current.data.order + 1;
    const prevRouteId = $state.current.data.order - 1;
    vm.hasNextRoute = this.appRouteEntries.filter((route) => route.data && route.data.order &&
      route.data.order === nextRouteId).length > 0;
    vm.hasPrevRoute = this.appRouteEntries.filter((route) => route.data && route.data.order &&
      route.data.order === prevRouteId).length > 0;
    // trying to set state on the application form fails here. matter of timing and/or instantiation of the form ctrl
    // vm.applicationform.$setPristine();
    // vm.applicationform.$setUntouched();
  }

  navigate(vm, config) {
    const {$state} = this;
    vm.navigating = true; //this is toggled by $routeChangeSuccess in the component controller
    const forward = config.direction === 'forward';
    const nextRouteId = $state.current.data.order - (forward ? -1 : 1);
    const nextRoute = this.appRouteEntries.filter((route) => route.data && route.data.order && route.data.order === nextRouteId);
    const nextRouteName = nextRoute && nextRoute.length === 1 && nextRoute[0].name ? nextRoute[0].name : null;
    if (nextRouteName) {
      $state.go(nextRouteName);
      this.MessagesSvc.clearAll();
      this.configNav(vm);
    } else {
      vm.navigating = false;
    }
  }

  //success and error handlers for persistence actions
  dataSaved(response, vm, actionObj) {
    //TODO- return to some version of what is commented out below when response is fixed
    if (this.UtilsSvc.notNullOrEmptyObj(response.data.application) && !this.UtilsSvc.isErrorMessage(response.data.responseStatus.errorMsg)) {
    //if (this.UtilsSvc.isResponseSuccess(response.data) && this.UtilsSvc.notNullOrEmptyObj(response.data.application)) {
      const next = actionObj && actionObj.next;
      const prev = actionObj && actionObj.prev;
      const enroll = actionObj && actionObj.enroll;
      const newAppData = response.data.application;
      this.$log.debug(response);
      vm.appData = vm.appData = newAppData; //get appData consistent across components
      this.ApplicationSvc.setApplication(response.data.application); //save to client storage
      vm.rootCtrl.persistAppData(); //update root component's appData object
      vm.applicationform.$setPristine();
      vm.applicationform.$setUntouched();
      this.MessagesSvc.clearAll();
      //because the component router doesn't seem to honor bindings on ng-outlet, I'm resorting to coupling the root controller and application controller
      if (vm.rootCtrl && vm.rootCtrl.rootform) {
        //set the root form state as well, to prevent unintentional unsaved changes dialogs after successful saves
        vm.rootCtrl.rootform.$setPristine();
        vm.rootCtrl.rootform.$setUntouched();
      }
      vm.allowSubmit = false;
      if (enroll) {
        enrollDialog.call(this, vm);
      }
      if (next) {
        this.navigate(vm, {
          direction: 'forward'
        });
      }
      if (prev) {
        this.navigate(vm, {
          direction: 'back'
        });
      }
    } else {
      this.dataNotSaved(response, vm);
    }
  }

  dataNotSaved(response, vm) {
    const {$log, MessagesSvc, UtilsSvc} = this;
    if (response && response.data && response.data.responseStatus && response.data.responseStatus.errorMsg) {
      if (UtilsSvc.isErrorMessage(response.data.responseStatus.errorMsg)) {
        $log.error(response.data.responseStatus.errorMsg);
        MessagesSvc.registerErrors(response.data.responseStatus.errorMsg);
      } else {
        $log.error('There was an error saving the application.');
        MessagesSvc.registerErrors('There was an error saving the application.');
      }
    } else { //chances are the session is invalid, so logout
      const errorsToLog = response.data ? ['There was an error saving the application.', response.data] : 'There was an error saving the application.';
      $log.error('There was an error saving the application.');
      MessagesSvc.registerErrors(errorsToLog);
    }
    vm.allowSubmit = false;
  }

  enroll(vm) {
    this.SpinnerControlSvc.startSpin({overlay: true});
    this.DataSvc.application.enroll(vm.appData)
      .then(
        function(response) {
          this.ApplicationSvc.enrollSuccess(response, vm);
        }.bind(this),
        function(reason) {
          this.ApplicationSvc.enrollFailure(reason, vm);
        }.bind(this)
      )
      .finally(function() {
        this.SpinnerControlSvc.stopSpin();
      }.bind(this));
  }

}

function enrollDialog(vm) {
  this.DialogSvc.confirm({
    heading: 'Ready to enroll this group?',
    text: `
      <p>Is your application verified and ready to enroll? If so, choose "Enroll" to enroll this group in Facets, 
      or return to SpeedERates without enrolling. You can come back to finish enrollment at a later time.</p>
    `,
    width: '40%',
    confirmButton: 'Enroll',
    cancelButton: 'Back to SpeedERates'
  }, {
      appendClassName: 'dialog-sga-normal',
      closeByEscape: false,
      closeByDocument: false
  })
  .then(
    (value) => {
      this.enroll(vm);
    },
    () => { //else, checkin and return to SER
      this.ApplicationSvc.checkin();
    }
  );
}
