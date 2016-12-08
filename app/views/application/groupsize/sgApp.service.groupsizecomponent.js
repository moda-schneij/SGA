'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:groupsizeComponent
 * @description
 * # GroupsizeComponent
 * Service of the Small Group Application app
 */
 
import angular from 'angular';

export default class GroupsizeComponentSvc {

  /*@ngInject*/
  constructor($log, UtilsSvc, $filter) {
    this.$log = $log;
    this.UtilsSvc = UtilsSvc;
    this.$filter = $filter;
  }

  /*************************************
  ** Create controller computed props **
  *************************************/

  setComputedProps(vm) {
    //Computed properties for Clark/Cowlitz inputs
    Object.defineProperty(vm, 'hasWAEmployees', {
      get: () => vm.appData.additionalState.filter((stateObj) => {
        if (stateObj) {
          return stateObj.state === 'WA';
        }
        return false;
      }).length > 0,
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'waEmployeeCount', {
      get: () => {
        const stateArrayClone = angular.copy(vm.appData.additionalState);
        const waObj = stateArrayClone.filter((stateObj) => stateObj && stateObj.state && stateObj.state === 'WA')[0];
        return waObj && waObj.noOfEmpPerState && 
          waObj.noOfEmpPerState > 0 && 
          makeNumArrWithZero(waObj.noOfEmpPerState);
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'empParticipation', {
      get: () => ({
        medical: vm.appCtrl.hasMedical ? (vm.appData.medEmpPartPct + '%') : 'N/A',
        dental: vm.appCtrl.hasDental ? (vm.appData.denEmpPartPct + '%') : 'N/A'
      }),
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(vm, 'depParticipationInput', {
      get: () => ({
        medical: !vm.appData.employeeOnlyPlan.medical && vm.appCtrl.hasMedical,
        dental: !vm.appData.employeeOnlyPlan.dental && vm.appCtrl.hasDental
      }),
      enumerable: true,
      configurable: true
    });
  }

  createEnrollmentContent(contentArr) {
    const contentObj = {};
    contentArr.forEach((contentVarsArr) => {
      contentObj[contentVarsArr[0]] = `
        <span class="output-value container-output-values">
          <span class="container-output-pairs">
            <span class="output-label coverage-type">Medical</span>
            <span class="output-value">${contentVarsArr[1]}</span>
          </span>
          <span class="container-output-pairs">
            <span class="output-label coverage-type">Dental</span>
            <span class="output-value">${contentVarsArr[2]}</span>
          </span>
        </span>`
    });
    return contentObj;
  }

}

function makeNumArrWithZero(length) {
  const returnArr = [];
  for (let i = 0; i < length + 1; i++) {
    returnArr.push(i);
  }
  return returnArr;
}