/* jshint node: true */

'use strict';

/**
 * @ngdoc overview
 * @name homeComponent
 * @description
 * Home component of the Small Group Application app.
 */

import angular from 'angular';
import groupSizeTemplate from './groupsize.html';

const tipContentAK = require('!html!./groupsizeinfoAK.html');
const tipContentOR = require('!html!./groupsizeinfoOR.html');

let appdata = {};

export const groupSizeFormComponent = {
  templateUrl: groupSizeTemplate,
  bindings: {
    $router: '<',
    appData: '<',
    statesArray: '<',
    rules: '<',
    options: '<'
  },
  require: {
    appCtrl: '^applicationComponent'
  },
  controller: GroupSizeFormCtrl
};

/*@ngInject*/
function GroupSizeFormCtrl(ApplicationSvc, UtilsSvc, $log, $compile, $scope, $sce, $timeout, ConstantsSvc, GroupsizeComponentSvc) {
  const vm = this;
  vm.defaultTipsoConfig = angular.copy(ConstantsSvc.TIPSOCONFIG);
  ConstantsSvc.TIPSOCONFIG = {width: 500};
  const TIPSOCONFIG = angular.copy(ConstantsSvc.TIPSOCONFIG);
  let deregisterAppDataWatch;
  let deregisterInitDataWatch;
  const bindingObj = { vm, ApplicationSvc, UtilsSvc, $log, $compile, $scope, $sce, $timeout, ConstantsSvc, GroupsizeComponentSvc };
  
  vm.onInitComplete = false; //use this value to signal to init-val-dependent directives that they can be rendered when onInit completes

  //a tooltip explaining why the user cannot choose employee-only for either LOB
  vm.explainDisabledEO = `<p>If this group's quote had dependents enrolling for a line of coverage, 
    the option to select employee-only for that line of coverage 
    will be disabled.</p>`;

  //a tooltip for FT and FE counts (explanation)
  vm.ftFteTipso = angular.extend(angular.copy(vm.defaultTipsoConfig), {content: 'Previous year FT and FTE will adjust to match total active employees'});


  vm.tipsoConfig = {
    OR: angular.extend(TIPSOCONFIG, { 
      tooltipHover: true,
      content: tipContentOR,
      offsetX: 164 //offset hand calculated because of time -- add a directive to determine the offset?
    }),
    AK: angular.extend(angular.copy(TIPSOCONFIG), { 
      tooltipHover: true,
      content: tipContentAK,
      offsetX: 164 //offset hand calculated because of time -- add a directive to determine the offset?
    }),
    FTE: angular.extend(angular.copy(vm.defaultTipsoConfig), {
      content: '<p>Previous year FT and FTE will adjust to match total active employees.</p>'
    }),
    EO: angular.extend(angular.copy(vm.defaultTipsoConfig), {
      content: `<p>If this group's quote had dependents enrolling for a line of coverage, 
        the option to select employee-only for that line of coverage 
        will be disabled.</p>`
    }),
    cobraElig: angular.extend(angular.copy(vm.defaultTipsoConfig), {
      content: `<p>To determine if your group is subject to COBRA, please confirm how many employees
        the group employed on a typical business day in the previous calendar year.</p>`
    }),
    akGroupCount: angular.extend(angular.copy(vm.defaultTipsoConfig), {
      content: `<p>On average, how many employees does the employer reasonably expect to employ on a
        typical business day in the current calendar year?</p>`
    }),
    akEmpCurrentCalYear: angular.extend(angular.copy(vm.defaultTipsoConfig), {
        content: `<p>If an employer was not in existence through the preceding calendar year, what is 
         the average number of employees does the employer reasonably expect to be employed on business 
         day in the current calendar year?</p>`
    })
  };

  //starting value to be reset in $onInit
  vm.originalFTCount = 0;

  //state and state employee count select data initialization
  vm.stateSelected = '';
  vm.stateCountSelected = '';
  vm.stateCountsArray = [];

  vm.appCtrl = {}; //this will be set in onInit

  vm.foo = true;

  //enable or disable the add button for add state/count
  vm.enableAddState = false;
  vm.onSelectStateOrCount = function() {
    $timeout(() => { //safety - needed for $modelValues to be updated correctly?
      const employeeByStateCtrl = vm.groupsizeform.employeesbystate;
      const totalEmployeesObj = checkEmployeeByStateTotals.call(bindingObj, {updateValidation: true});
      const stateSelectVal = employeeByStateCtrl.stateselect.$modelValue;
      const stateCountVal = employeeByStateCtrl.statecount.$modelValue;
      if (stateSelectVal && stateCountVal) {
        vm.enableAddState = !totalEmployeesObj.exceedsTotals;
        $log.debug('TOTAL EMPLOYEES MATCHED? ' + totalEmployeesObj.totalsMatch);
      }
    });
  };

  //new handler for adjusting FT based on FTE selection
  vm.onChangeFTEEnrollments = (value) => {
    vm.appData.fullTimeEmployees = vm.originalFTCount - value;
  };

  // handler for clicking on the add button once a state and quantity are selected
  vm.addState = function(state, count) {
    $log.debug(state + ', ' + count);
    vm.appData.additionalState.push({
      state: state,
      noOfEmpPerState: count
    });
    checkEmployeeByStateTotals.call(bindingObj, {updateValidation: true});
    flagStatesArray.call(angular.extend(this, {vm: vm}));
    setStateCountArray.call(angular.extend(this, {vm: vm}));
    //TODO - reset the states and counts array - removal of call to getOutput rendered this not working
    //getOutput.call(bindingObj); //TODO - remove if clear it's not needed
    resetEmployeeByStateForm.call(bindingObj); //TODO - remove if clear it's not needed
    $log.debug('added states: ' + angular.toJson(vm.appData.additionalState));
  };

  // handler for clicking on the remove button next to a state and employee count
  vm.removeState = function(stateCode) {
    if (stateCode === 'WA') {
      vm.appData.waPdxMetroCoverageCount = 0;
    }
    vm.appData.additionalState = vm.appData.additionalState
      .filter((stateObj) => stateObj.state !== stateCode);
    //getOutput.call(bindingObj); //TODO - remove if clear it's not needed
    //resetEmployeeByStateForm.call(bindingObj); //TODO - remove if clear it's not needed
    checkEmployeeByStateTotals.call(bindingObj, {updateValidation: true});
    flagStatesArray.call(angular.extend(this, {vm: vm}));
    setStateCountArray.call(angular.extend(this, {vm: vm}));
    resetEmployeeByStateForm.call(bindingObj);
    $log.debug('removed state: ' + stateCode);
  };

  vm.getStateDisplayName = function(stateCode) {
    return vm.statesArray.filter((state) => state.value === stateCode)[0].displayName;
  };

  //these view-specific values will be reset after appdata is delivered
  vm.needsEmployeeStateCounts = false;

  vm.$onInit = function() {
    $log.debug(vm);
    $log.debug('I am in the groupsize component controller');
    
    updateViewValues.call(bindingObj);
    if (!vm.output) {
      getOutput.call(bindingObj, {init: true});
    }
    vm.groupOR = vm.appCtrl.groupOR;
    vm.groupAK = vm.appCtrl.groupAK;
    // vm.appData.fullTimeEmployees = angular.copy(vm.appData.totalActiveEmpCount);
    vm.originalFTCount = angular.copy(vm.appData.totalActiveEmpCount);
    vm.onInitComplete = true;
    GroupsizeComponentSvc.setComputedProps(vm);
    checkEmployeeByStateTotals.call(bindingObj, {updateValidation: true});
    deregisterInitDataWatch();
    vm.appCtrl.resetPristineState();

    deregisterInitDataWatch = $scope.$watchGroup([
      () => vm.appData, () => vm.appCtrl.statesArray
    ], (newVal) => {
      // if (UtilsSvc.notNullOrEmptyObj(newVal[0]) && UtilsSvc.notNullOrEmptyObj(newVal[1])) {
      //   updateViewValues.call(bindingObj);
      //   angular.forEach(vm.appCtrl.statesArray, (value, key) => {
      //     if (value.value !== "HI") {
      //       vm.statesArray.push(value);
      //     }
      //   });
      //   if (!vm.output) {
      //     getOutput.call(bindingObj, {init: true});
      //   }
      //   vm.groupOR = vm.appCtrl.groupOR;
      //   vm.groupAK = vm.appCtrl.groupAK;
      //   // vm.appData.fullTimeEmployees = angular.copy(vm.appData.totalActiveEmpCount);
      //   vm.originalFTCount = angular.copy(vm.appData.totalActiveEmpCount);
      //   vm.onInitComplete = true;
      //   GroupsizeComponentSvc.setComputedProps(vm);
      //   checkEmployeeByStateTotals.call(bindingObj, {updateValidation: true});
      //   deregisterInitDataWatch();
      //   vm.appCtrl.resetPristineState();
      // }
    });

    deregisterAppDataWatch = $scope.$watch(
      () => vm.appData,
      (newVal) => {
        if (newVal && UtilsSvc.notNullOrEmptyObj(newVal) && vm.output) {
          getOutput.call(bindingObj);
        }
      },
      true
    );

    vm.appCtrl.updateAppData = function() {
      saveAppData.call(bindingObj);
    };
  };

  vm.$onDestroy = function() {
    deregisterAppDataWatch();
  };
}

function updateAppdata() { //call bound to the controller binding object
  appdata = this.vm.appCtrl && this.vm.appData;
}

//set values for the view after appdata is loaded in onInit
function updateViewValues() {
  updateAppdata.call(this);
  this.vm.needsEmployeeStateCounts = appdata.totalEmpAndCobraMedEnrolling > 0;
}

function getOutput(option) {
  updateAppdata.call(this);
  setStateCountArray.call(this);
  flagStatesArray.call(this);
  const employeeOnlyPlan = appdata.employeeOnlyPlan;
  const contentArr = [
    ['Eligible for coverage', appdata.medEligibleEmpCoverage, appdata.denEligibleEmpCoverage],
    ['Ineligible due to group rules', appdata.medNotEligibleEmpCoverage, appdata.denNotEligibleEmpCoverage],
    ['Total eligible', appdata.totalMedEligibleEmployees, appdata.totalDenEligibleEmployees],
    ['Waiving due to other coverage', appdata.medEmpWaiveCoverage, appdata.denEmpWaiveCoverage],
    ['Opting out', appdata.medEmpOptOutCoverage, appdata.denEmpOptOutCoverage],
    ['Total enrolling', appdata.totalMedEmpEnrolling, appdata.totalDenEmpEnrolling],
    ['COBRA / State continuation enrollees', appdata.totalMedEmpCobraEnrolling, appdata.totalDenEmpCobraEnrolling],
    ['Total plus COBRA enrolling', appdata.totalEmpAndCobraMedEnrolling, appdata.totalEmpAndCobraDenEnrolling]
  ];
  const groupSizeStaticContentArr = [
    {
      name: 'enrollment',
      title: 'Enrollment deductions and additions',
      content: this.GroupsizeComponentSvc.createEnrollmentContent(contentArr)
    }
  ];
  const sectionsArr = this.ApplicationSvc.populateSections(groupSizeStaticContentArr);
  this.$log.debug('SECTIONS ARRAY');
  this.$log.debug(sectionsArr);
  this.vm.output = sectionsArr;
  this.vm.enrollmentSection = sectionsArr.filter((section) => section.name === 'enrollment')[0].content;
  this.$timeout(() => {
    if (this.vm.needsEmployeeStateCounts) {
      resetEmployeeByStateForm.bind(this);
    }
  });
  if (option && option.init) {
    this.$timeout(this.vm.appCtrl.setRouteReady);
  }
}

function saveAppData() { //call bound to controller binding object
  this.vm.appCtrl.saveAppData(); //trigger parent controller submit updated data
}

//sets and updates the available state count for adding new count by state row
function setStateCountArray() { //call bound to controller binding object
  updateAppdata.call(this);
  const existingTotal = getEmployeeByStateTotals.call(this);
  //total enrolling should not be exceeded by state-by-state employee counts
  const totalEnrolling = parseInt(appdata.totalEmpAndCobraMedEnrolling, 10);
  const additionalEmployees = totalEnrolling - existingTotal;
  this.vm.stateCountsArray = [];
  for (let i = 0; i < additionalEmployees; i++) {
    this.vm.stateCountsArray.push(i + 1);
  }
}

//sets and updates the available states for adding new count by state row
function flagStatesArray() { //call bound to controller binding object
  const states = this.vm.statesArray;
  updateAppdata.call(this);
  const addedStates = appdata.additionalState.map(function(stateObj) {
    return stateObj.state;
  });
  return states.map(function(stateObj) {
    stateObj.available = !addedStates.includes(stateObj.value);
    return stateObj;
  });
}

//check employee-by-state total against overall totals (the by-state total msut match the overall totals)
function checkEmployeeByStateTotals(option) { //call bound to controller binding object
  const updateValidation = option && option.updateValidation || false;
  updateAppdata.call(this);
  const totalByState = getEmployeeByStateTotals.call(this);
  const stateCountSelected = this.vm.stateCountSelected;
  //total enrolling should not be exceeded by state-by-state employee counts
  const totalEnrolling = parseInt(appdata.totalEmpAndCobraMedEnrolling, 10);
  //don't add new state value if calling after adding or removing a state
  const newStateVal = !updateValidation && stateCountSelected !== '' ? parseInt(stateCountSelected, 10) : 0;
  const totalsMatch = totalByState + newStateVal === totalEnrolling;
  const exceedsTotals = totalByState + newStateVal > totalEnrolling;
  //set invalid state if totals aren't equal, optionally
  if (updateValidation) {
    this.vm.appCtrl.updateValidity('statesMatchTotal', totalsMatch);
  }
  return {
    totalsMatch: totalsMatch,
    exceedsTotals: exceedsTotals
  }; //have we matched employee-by-state and total counts?
}

//get the sum total of current employees by state
function getEmployeeByStateTotals() { //call bound to controller binding object
  updateAppdata.call(this);
  //may be a cleaner way to write this with a single reduce, but can't figure it out atm
  const totalByStateArr = appdata.additionalState.map(function(stateObj) {
    let returnVal = 0;
    angular.forEach(stateObj, function(value, prop) {
      if (prop === 'noOfEmpPerState') {
        returnVal += parseInt(value, 10);
      }
    });
    return returnVal;
  });
  const totalByState = totalByStateArr.length > 0 ? totalByStateArr.reduce(function(pval, cval) {
    return pval + cval;
  }) : 0;
  return totalByState;
}

//reset the employee by state form
function resetEmployeeByStateForm() { //call bound to controller binding object
  const vm = this.vm;
  const employeesbystateForm = vm.groupsizeform.employeesbystate;
  vm.stateSelected = ''; //reset state input
  vm.stateCountSelected = ''; //reset employee count input
  vm.enableAddState = false; //reset the button
  //reset form and controls - maybe there's a better way to do this, but programmatic reset at the form level alone doesn't do it
  //employeesbystateForm.$setPristine();
  //employeesbystateForm.$setUntouched();
  employeesbystateForm.stateselect.$setPristine();
  employeesbystateForm.stateselect.$setUntouched();
  employeesbystateForm.statecount.$setPristine();
  employeesbystateForm.statecount.$setUntouched();
  this.$log.debug('the vm inside resetEmployeeByStateForm');
  this.$log.debug(vm);
}
