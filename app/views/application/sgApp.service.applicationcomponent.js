'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:applicationComponent
 * @description
 * # ApplicationComponent
 * Service of the Small Group Application app
 */
 
import angular from 'angular';
import sgAppRoot from '../../root/sgApp.component.root'; //this service is defined on the root module and injected there
const routeConfig = require('json!./routes.json');

class ApplicationComponentSvc {

  /*@ngInject*/
  constructor($log, $timeout, SpinnerControlSvc, UtilsSvc, DialogSvc, DataSvc, REGEXS, toArrayFilter, RulesSvc, OptionsSvc, ApplicationSvc, MessagesSvc, SGA_CLIENT_KEYS) {
    this.$log = $log;
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
    this.getNextStep = this.getNextStep.bind(this);
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
        vm.rootCtrl.appdata && 
        vm.rootCtrl.appdata.appStatus === 'P' && 
        ((!vm.applicationform.$pristine && vm.applicationform.modified) || vm.allowSubmit),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'inProgressApp', {
      get: () => vm.rootCtrl.appdata && 
        vm.rootCtrl.appdata.appStatus === 'P',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'completedApp', {
      get: () => vm.rootCtrl.appdata && 
        vm.rootCtrl.appdata.appStatus === 'C',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'failedApp', {
      get: () => vm.rootCtrl.appdata && 
        vm.rootCtrl.appdata.appStatus === 'F',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'enrolledApp', {
      get: () => vm.rootCtrl.appdata && 
        vm.rootCtrl.appdata.appStatus === 'S',
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'disallowFutureDependents', {
      get: () => ({
        dental: !vm.hasDenDependents && vm.appdata.employeeOnlyPlan.dental,
        medical: !vm.hasMedDependents && vm.appdata.employeeOnlyPlan.medical
      }),
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'enableDependentInputs', {
      get: () => ({
        dental: vm.hasDenDependents || !vm.appdata.employeeOnlyPlan.dental,
        medical: vm.hasMedDependents || !vm.appdata.employeeOnlyPlan.medical
      }),
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'employeeOnlyApp', {
      get: () => vm.appdata.employeeOnlyPlan.medical &&
        vm.appdata.employeeOnlyPlan.dental,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'anyPlanSelected', {
      get: () => ({
        dental: vm.appdata.groupPlan.categories.dental.plans.filter((plan) => plan.selected).length > 0,
        medical: vm.appdata.groupPlan.categories.medical.plans.filter((plan) => plan.selected).length > 0
      }),
      enumerable: true,
      configurable: true
    });
    
    Object.defineProperty(vm, 'employeeOnlyForSelectedLines', {
      get: () => (vm.appdata.employeeOnlyPlan.medical && vm.appdata.employeeOnlyPlan.dental) || 
        (vm.appdata.employeeOnlyPlan.medical && (!vm.hasDental || !vm.anyPlanSelected.dental)) ||
        (vm.appdata.employeeOnlyPlan.dental && (!vm.hasMedical || !vm.anyPlanSelected.medical)),
      enumerable: true,
      configurable: true
    });

  }

  resetPristineState(vm) {
    this.$timeout(() => {
      vm.applicationform.$setPristine();
      if (vm.applicationform.modifiedChildFormsCount > 1) {
        vm.applicationform.modifiedChildForms.forEach((formCtrl) => {
          formCtrl.$setPristine();
        });
      }
    }, 50);
  }

  setRulesAndOptions(vm) {
    vm.rules = this.RulesSvc.rules;
    vm.options = this.OptionsSvc.options;
    vm.addressRules = this.RulesSvc.rules.addressRules;
    vm.contactRules = this.RulesSvc.rules.contactRules;
    vm.groupRules = this.RulesSvc.rules.groupRules;
    vm.groupPlanRules = this.RulesSvc.rules.groupPlanRules;
    //add a string for ng-pattern for zip codes (TODO - add others)
    vm.addressRules.zip.pattern = '\\d{' + this.RulesSvc.rules.addressRules.zip.minLength + ',' + this.RulesSvc.rules.addressRules.zip.maxLength + '}';
  }

  //set *static* values for the view after appdata is loaded in onInit
  updateViewValues(vm) { 
    const appdata = vm.appdata = vm.rootCtrl.appdata;
    const medEnrollments = appdata.groupPlan.categories.medical.enrollments;
    const denEnrollments = appdata.groupPlan.categories.dental.enrollments;
    vm.groupOR = vm.appdata.group.clientState === 'OR';
    vm.groupAK = vm.appdata.group.clientState === 'AK';
    vm.denExceedsMed = appdata.totalEmpAndCobraMedEnrolling < appdata.totalEmpAndCobraDenEnrolling;
    vm.denOnlyEmployees = appdata.totalEmpAndCobraDenEnrolling - appdata.totalEmpAndCobraMedEnrolling;
    vm.groupName = this.UtilsSvc.notNullOrEmpty(appdata.group.facetsOutputName) ?
      appdata.group.facetsOutputName : this.UtilsSvc.notNullOrEmpty(appdata.group.employerLegalName) ?
      appdata.group.employerLegalName : 'this group';
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
    const sgaClientValToSet = vm.appdata.sgaClient ? angular.fromJson(vm.appdata.sgaClient) : {};
    sgaClientValToSet[this.PROGRESS_KEY] = nextRouteName;
    vm.appdata.sgaClient = angular.toJson(sgaClientValToSet);
  }

  //retrive the name of the next step to continue with
  getNextStep(vm) {
    //hacky and bad way of getting the final route name - there ought to be a better way. not even sure if this will throw an error at any point
    const routeEntries = angular.isFunction(vm.$router.registry._rules.entries) && Array.from(vm.$router.registry._rules.entries())
      .filter((entry) => entry[0] && entry[0] === 'applicationComponent')[0][1];
    const finalRouteName = routeEntries && angular.isArray(routeEntries.rules) && routeEntries.rules[routeEntries.rules.length - 1]._routeName;
    const sgaClientVal = vm.appdata.sgaClient ? angular.fromJson(vm.appdata.sgaClient) : {};
    //if this is an in-progress app, go back to last completed or saved step, otherwise to the end of the application form
    return vm.appdata.appStatus === 'P' ? sgaClientVal[this.PROGRESS_KEY] : angular.isString(finalRouteName) ? finalRouteName : null; //should be a route name as a string or undefined
  }

  returnToLastStep(vm) {
    const routeName = this.getNextStep(vm)
    vm.$router.navigate([routeName]);
  }

  //navigation methods
  configNav(vm) {
    const nextRouteId = vm.$router.currentInstruction.component.routeData.data.order;
    const prevRouteId = vm.$router.currentInstruction.component.routeData.data.order - 2;
    vm.hasNextRoute = !!routeConfig[(nextRouteId)];
    vm.hasPrevRoute = !!routeConfig[(prevRouteId)];
    vm.applicationform.$setPristine();
    vm.applicationform.$setUntouched();
  }

  navigate(vm, config) {
    const forward = config.direction === 'forward';
    const nextRouteId = vm.$router.currentInstruction.component.routeData.data.order - (forward ? 0 : 2);
    const nextRouteName = routeConfig[nextRouteId].name;
    if (nextRouteName) {
      vm.$router.navigate([nextRouteName]);
      this.MessagesSvc.clearAll();
      this.configNav(vm);
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
      vm.appdata = vm.rootCtrl.appdata = newAppData; //get appdata consistent across components
      this.ApplicationSvc.setApplication(response.data.application); //save to client storage
      vm.rootCtrl.persistAppData(); //update root component's appdata object
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
    if (response && response.data && response.data.responseStatus && response.data.responseStatus.errorMsg) {
      if (this.UtilsSvc.isErrorMessage(response.data.responseStatus.errorMsg)) {
        this.$log.error(response.data.responseStatus.errorMsg);
        this.MessagesSvc.registerErrors(response.data.responseStatus.errorMsg);
      } else {
        this.$log.error('There was an error saving the application.');
        this.MessagesSvc.registerErrors('There was an error saving the application.');
      }
    } else { //chances are the session is invalid, so logout
      const errorsToLog = response.data ? ['There was an error saving the application.', response.data] : 'There was an error saving the application.';
      this.$log.error('There was an error saving the application.');
      this.MessagesSvc.registerErrors(errorsToLog);
    }
    vm.allowSubmit = false;
  }

  enroll(vm) {
    this.SpinnerControlSvc.startSpin({overlay: true});
    this.DataSvc.application.enroll(vm.appdata)
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

export default angular
  .module('sgAppRoot')
  .service('ApplicationComponentSvc', ApplicationComponentSvc);