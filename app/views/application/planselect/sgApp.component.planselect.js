/* jshint node: true */

'use strict';

/**
 * @ngdoc overview
 * @name planSelectComponent
 * @description
 * Plan select component of the Small Group Application app.
 */

import angular from 'angular';
import planSelectTemplate from './planselect.html';
import ratesTable from './ratecalculations.html';
const vmVars = {};
let plansObj;
let medPlans;
let denPlans;
let appData;

export const planSelectFormComponent = {
  templateUrl: planSelectTemplate,
  bindings: {
    appData: '<',
    rules: '<',
    options: '<'
  },
  require: {
    appCtrl: '^applicationComponent'
  },
  controller: PlanSelectFormCtrl
};

/*@ngInject*/
function PlanSelectFormCtrl(ConstantsSvc, PlanSelectSvc, RulesSvc, UtilsSvc, OptionsSvc, $log, ApplicationSvc, $rootScope, $scope, $timeout, $window, REGEXS, toArrayFilter) {
  const vm = this;
  vm.appDataClone = {};
  let deregisterComputedMedTotals;
  const bindingObj = { vm, ConstantsSvc, PlanSelectSvc, RulesSvc, UtilsSvc, $log, ApplicationSvc, $rootScope, $scope, $timeout, $window, REGEXS, toArrayFilter };

  const tipContentNoEnrollment = `<p>Selected plans must have at least one member enrolled. 
    Please remove this plan if it has no enrollments.</p>`;
  const tipContentMustMatchTotal = `<p>Enrollments in all selected medical plans must add up to match enrollment totals, 
    by enrollment type.</p>`;

  //get and clone default Tipso config, modify if needed
  const defaultTipsoConfig = angular.copy(ConstantsSvc.TIPSOCONFIG);

  vm.foo = 'bar';

  vm.ratesTableUrl = ratesTable;

  //wanky way of delaying output
  vm.showTable = false;

  //state and state employee count select data initialization

  vm.plans = {
    medical: {
      selected: [],
      riders: {
        vis: {
          selected: [],
          add: false
        },
        he: {
          selected: [],
          add: false
        }
      }
    },
    dental: {
      selected: [],
      riders: {
        orth: {
          selected: [],
          add: false
        }
      },
      directOption: {
        selected: []
      }
    }
  };

  vm.tipsoConfig = {
    noEnrollments: angular.extend(angular.copy(defaultTipsoConfig), {
      content: tipContentNoEnrollment
    }),
    mustMatchTotals: angular.extend(angular.copy(defaultTipsoConfig), {
      content: tipContentMustMatchTotal
    })
  };

  vm.rates = {}; //object to hold various view models for calculations on the table
  vm.rateTypes = []; //to hold objects for each rate type (employer only or employer plus ...)

  vm.dentalOnly = false;
  vm.medicalOnly = false;

  //return the value for EE rateType, and a double-dash for other rateTypes (for employee-only)
  vm.empOnly = (name, value) => (REGEXS.empRate.test(name) ? value : '--');

  vm.notEmp = (name) => !REGEXS.empRate.test(name);

  vm.onSelectPlan = (selectedPlan, option) => {
    let doPlan;
    const selectedVal = option && option.selected ? option.selected : false;
    const callback = REGEXS.medical.test(selectedPlan.planCategory) ? vm.updateAndValidateMedEnrollments : angular.noop;
    selectedPlan.selected = selectedVal; //toggle the selected value
    if (PlanSelectSvc.isDeltaWithDO(selectedPlan) && RulesSvc.rules.groupPlanRules.preselectDirectOption) {
    //TODO - disable preselection of DO plans when this rule applies, but debug effects on Delta enrollments (all zeroes in the model)
      doPlan = selectedPlan.selected ? //we are adding a plan from the paylaod
        //but use the clone of the payload to avoid issues with DO view values getting in the payload
        vm.appDataClone.groupPlan.categories.dental.plans.filter((thisPlan) =>
          thisPlan.dualId === selectedPlan.dualId && thisPlan.dual && REGEXS.directOption.test(thisPlan.planId))[0] :
        //we are removing a plan from the view
        vm.plans.dental.directOption.selected[0];
      if (doPlan) {
        doPlan.selected = selectedPlan.selected; //toggle the direct option plan if there is one
      }
    }
    //re-run cross-validation of multiple medical enrollments
    $log.debug(selectedPlan);
    PlanSelectSvc.updatePlans(vm, selectedPlan, callback);
    //TODO - disable preselection of DO plans when this rule applies, but debug effects on Delta enrollments (all zeroes in the model)
    if (doPlan && RulesSvc.rules.groupPlanRules.preselectDirectOption) {
      PlanSelectSvc.updatePlans(vm, doPlan);
    }
  };

  vm.onCheckPlan = (event, plan) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const maxPlans = PlanSelectSvc.checkMaxPlans(vm, plan.planType);
    if (!maxPlans) {
      vm.onSelectPlan(plan);
    }
  };

  vm.onChangePlanOption = (model) => { //triggered by checkboxes to add rider plans
    if (!model.add) { //if the rider option is unchecked
      angular.forEach(model.selected, (plan) => {
        plan.selected = false;
        PlanSelectSvc.updatePlans(vm, plan);
      }); //unselect all plans
      model.selected = []; //reset the array of selected plans (or plan, really, for riders)
    }
  };

  vm.onChangeDirectOptionEnrollment = () => {
    $timeout(() => {
      PlanSelectSvc.updateDeltaDentalPlan(vm);
    });
  };

  /******************************************************************************************
  ** Two different approaches to getting subtotals - TBD what's better and more extensible **
  ******************************************************************************************/

  vm.subtotaler = (option, arr) => {
    if (angular.isArray(arr)) {
      const opt = option || {};
      return UtilsSvc.subtotaler(opt, arr);
    }
    return '';
  };

  //TODO - test this still works
  vm.totalCount = function(option, arr) {
    if (angular.isArray(arr)) {
      const opt = option || {};
      return UtilsSvc.subtotaler(opt, arr);
    }
    return '';
  };

  //force re-validation on the table when one input is updated
  vm.updateAndValidateMedEnrollments = (plan) => {
    if (vm.planratesform) {
      const invalidMatchesTotal = UtilsSvc.isArrayOfOneOrMore(vm.planratesform.$error.matchestotalenrollment) ?
        vm.planratesform.$error.matchestotalenrollment : [];
      const validMatchesTotal = UtilsSvc.isArrayOfOneOrMore(vm.planratesform.$$success.matchestotalenrollment) ?
        vm.planratesform.$$success.matchestotalenrollment : [];
      const invalidNoEnrollments = UtilsSvc.isArrayOfOneOrMore(vm.planratesform.$error.noplanenrollments) ?
        vm.planratesform.$error.noplanenrollments : [];
      const validNoEnrollments = UtilsSvc.isArrayOfOneOrMore(vm.planratesform.$$success.noplanenrollments) ?
        vm.planratesform.$$success.noplanenrollments : [];
      //concatenate the inputs in error or valid, so we re-run validations on all of them
      // const medCountInputs = invalidInputs.concat(validInputs);
      const medCountInputs = [].concat(invalidMatchesTotal, validMatchesTotal, invalidNoEnrollments, validNoEnrollments);
      if (UtilsSvc.isArrayOfOneOrMore(medCountInputs)) {
        runParsers(medCountInputs);
        PlanSelectSvc.updatePlans(vm, plan, null, {validateCountsOnly: true}); //null is the callback (there is none), and the option prevents zeroing of counts as they're typed in
      }
    }
  };

  function runParsers(medCountInputs) {
    angular.forEach(medCountInputs, function(input, idx) {
      //find the parsers on the inputs
      //the first parser is where the validation is run
      //its name is 'validityParser' - this is coupled, but I don't have time for a better solution
      //run the parser (revalidate), if it exists
      if (input && input.hasOwnProperty('$parsers')) {
        angular.isArray(input.$parsers) && angular.isFunction(input.$parsers[0]) ? input.$parsers[0]() : angular.noop();
      }
    });
  }

  vm.dummy = ''; //use for a fake model for the input that displays total count

  vm.$onInit = () => {
    $log.debug(vm);
    $log.debug('I am in the plan selection component controller');

    //set up a clone of the main application data object
    appDataClone.call(bindingObj);
    PlanSelectSvc.setRules(vm); //call this first, as there are dependencies on rules in other calls
    PlanSelectSvc.setOptions(vm);
    updateAppData.call(bindingObj); //this just updates the module-global vars for use throughout the controller
    PlanSelectSvc.populatePlans(vm, vmVars);
    PlanSelectSvc.anyPlansAdded(vm); //also calls setTableValues at the right time
    PlanSelectSvc.setStaticValues(vm);
    $rootScope.$evalAsync(vm.appCtrl.resetPristineState);

    deregisterComputedMedTotals = $scope.$watch(
      () => vm.plans.medical.selected,
      (selMedPlans) => {
        PlanSelectSvc.computeMedicalTotals(selMedPlans, vm, vmVars);
      },
      true
    );
  };

  vm.$onDestroy = function() {
    if (angular.isFunction(deregisterComputedMedTotals)) {
      deregisterComputedMedTotals();
    }
  };
}

function appDataClone() {
  angular.copy(this.vm.appCtrl.appData, this.vm.appDataClone);
}

function updateAppData() {
  vmVars.totalMedEnroll = 0;
  vmVars.totalDenEnroll = 0;
  appData = this.vm.appCtrl.appData;
  plansObj = vmVars.plansObj = appData.groupPlan.categories;
  medPlans = vmVars.medPlans = plansObj.medical;
  denPlans = vmVars.denPlans = plansObj.dental;
  angular.forEach(medPlans.enrollments, (val) => {
    vmVars.totalMedEnroll += val;
  });
  angular.forEach(denPlans.enrollments, (val) => {
    vmVars.totalDenEnroll += val;
  });
  this.PlanSelectSvc.setComputedProps(this.vm, vmVars);
}
