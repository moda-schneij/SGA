'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:groupinfoComponent
 * @description
 * # GroupinfoComponent
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class GroupinfoComponentSvc {

  /*@ngInject*/
  constructor($log, $timeout, UtilsSvc, RulesSvc, CachingSvc) {
    this.$log = $log;
    this.$timeout = $timeout;
    this.UtilsSvc = UtilsSvc;
    this.RulesSvc = RulesSvc;
    this.CachingSvc = CachingSvc;
  }

  /*************************************
   ** Create controller computed props **
   *************************************/

  setComputedProps(vm) {
    //Computed properties
    Object.defineProperty(vm, 'hasSelectedMedPlans', {
      get: () => vm.appCtrl.appdata.groupPlan.categories.medical.plans.filter((plan) => plan.selected).length > 0,
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(vm, 'hasSelectedDenPlans', {
      get: () => vm.appCtrl.appdata.groupPlan.categories.dental.plans.filter((plan) => plan.selected).length > 0,
      configurable: true,
      enumerable: true
    });
  }

  updateViewValues(vm) {
    if (this.UtilsSvc.isNonEmptyString(vm.appCtrl.appdata.group.naicsCode)) {
      vm.selectedNAICS = { //prevent invalid state by temporarily setting just the code in a temp object
        code: vm.appCtrl.appdata.group.naicsCode
      };
    }
    vm.primaryAddressSame = false;
  }

  checkHasOtherPlans(vm) { //onInit, set booleans based on whether there are values for other plans in the data
    const appdata = vm.appCtrl.appdata;
    vm.otherCoverage = {
      medical: appdata.currentMedCarrier && appdata.currentMedCarrier !== '',
      dental: appdata.currentDenCarrier && appdata.currentDenCarrier !== ''
    };
  }

  //this is all to avoid having the values for percentages overwrite dollar values, or vice-versa
  updateEmployerContributions(vm, action, callback) {
    const appdata = vm.appCtrl.appdata;
    const set = action && action.set; //this is a param passed onInit, so we don't proceed as though we were saving
    const save = action && action.save;
    const empContribKey = appdata.employerContribIsPct ? 'percentages' : 'dollars';
    const contribObj = vm.employerContributions[empContribKey];
    angular.forEach(contribObj, function(value, key) {
      const contribObjKey = contribObj[key];
      const appdataVal = appdata[key];
      const rulesKey = this.RulesSvc.rules.groupRules[key];
      if (set) {
        contribObjKey.amount = appdataVal;
        contribObjKey.minContribPct = rulesKey.minContribPct;
        contribObjKey.minContribDol = rulesKey.minContribDol;
      }
      if (save) {
        appdata[key] = contribObjKey.amount;
      }
    }, this);
    if (!set) {
      zeroContributions.apply(this, [vm, callback]);
    }
  }

  setOrResetEmployerContribs(vm) {
    const groupRules = this.RulesSvc.rules.groupRules;
    const empContribsObj = { //set in setter helper called on init and changing contrib type
      percentages: {
        medPremiumEmpContribution: {
          amount: this.UtilsSvc.safeToString(groupRules.medPremiumEmpContribution.minContribPct)
        },
        denPremiumEmpContribution: {
          amount: this.UtilsSvc.safeToString(groupRules.denPremiumEmpContribution.minContribPct)
        },
        medPremiumDepContribution: {
          amount: this.UtilsSvc.safeToString(groupRules.medPremiumDepContribution.minContribPct)
        },
        denPremiumDepContribution: {
          amount: this.UtilsSvc.safeToString(groupRules.denPremiumDepContribution.minContribPct)
        }
      },
      dollars: {
        medPremiumEmpContribution: {
          amount: this.UtilsSvc.toFixedTwo(groupRules.medPremiumEmpContribution.minContribDol)
        },
        denPremiumEmpContribution: {
          amount: this.UtilsSvc.toFixedTwo(groupRules.denPremiumEmpContribution.minContribDol)
        },
        medPremiumDepContribution: {
          amount: this.UtilsSvc.toFixedTwo(groupRules.medPremiumDepContribution.minContribDol)
        },
        denPremiumDepContribution: {
          amount: this.UtilsSvc.toFixedTwo(groupRules.denPremiumDepContribution.minContribDol)
        }
      }
    };
    vm.employerContributions = {};
    //temporary vm object for holding employer contribution values
    angular.copy(empContribsObj, vm.employerContributions);
  }

  clearPrimaryAddress(vm) {

    const primAddress = vm.appCtrl.appdata.group.address.filter((address) => address.addressType === 'PRIM')[0];

    if (this.UtilsSvc.notNullOrEmptyObj(primAddress)) {
      Object.keys(primAddress)
        .filter((key) => key !== 'addressType')
        .forEach((key) => {
          primAddress[key] = '';
        });
    }
  }

  clearBillingAddress(vm) {
    const billAddress = vm.appCtrl.appdata.group.address.filter((address) => address.addressType === 'BILL')[0];

    if (this.UtilsSvc.notNullOrEmptyObj(billAddress)) {
      Object.keys(billAddress)
        .filter((key) => key !== 'addressType')
        .forEach((key) => {
          billAddress[key] = '';
        });
      //also clear billing name
      vm.appCtrl.appdata.group.billingName = '';
    }
  }
  
  copyBillingAddress(vm) {
      let primAddrCopy = null;
  
      vm.appCtrl.appdata.group.billingName = angular.copy(vm.appCtrl.appdata.group.employerLegalName);

      if (!(/2016/).test(vm.appCtrl.effDate.getFullYear())) {
        primAddrCopy = angular.copy(vm.appCtrl.appdata.group.address[1]);
        primAddrCopy.addressType = 'BILL';
        vm.appCtrl.appdata.group.address[2] = primAddrCopy;
      } else {
        primAddrCopy = angular.copy(vm.appCtrl.appdata.group.address[0]);
        primAddrCopy.addressType = 'BILL';
        vm.appCtrl.appdata.group.address[1] = primAddrCopy;
      }
  }

  clearBillingContact(vm) {
    const billContact = vm.appCtrl.appdata.group.contact.filter((contact) => contact.contactType === 'BILL')[0];
    if (this.UtilsSvc.notNullOrEmptyObj(billContact)) {
      Object.keys(billContact)
        .filter((key) => key !== 'contactType' && key !== 'id')
        .forEach((key) => {
          billContact[key] = '';
        });
    }
  }

  restoreNAICS(vm) {
    //if we're re-populating the previously set NAICS selection
    if (this.UtilsSvc.isNonEmptyString(vm.appCtrl.appdata.group.naicsCode)) {
      vm.searchingNAICS = true;
      //this should either return a cached version from storage or get the specific NAICS result via ajax
      this.CachingSvc.getNAICS(vm.appCtrl.appdata.group.naicsCode)
        .then((response) => {
          vm.selectedNAICS = angular.isDefined(response) ? response : {};
          vm.noNAICSResults = angular.isUndefined(response);
        }, (rejection) => {
          this.$log.error('Failed to get current NAICS code: ' + angular.fromJson(rejection));
          vm.noNAICSResults = true;
        })
        .finally(() => {
          vm.searchingNAICS = false;
          vm.appCtrl.resetPristineState();
        });
    }
  }

  resetPristineStateOnNAICSSearch(vm) {
    if (vm.appCtrl.applicationform.$pristine && vm.groupinfoform.$pristine && vm.groupinfoform.groupcodes.$pristine) {
      this.$timeout(() => {
        vm.appCtrl.resetPristineState();
        vm.groupinfoform.$setPristine();
        vm.groupinfoform.groupcodes.$setPristine();
      }, 50);
    }
  }

}

function zeroContributions(vm, callback) {
  const groupRules = this.RulesSvc.rules.groupRules;
  const isNumberOrNumString = this.UtilsSvc.isNumberOrNumString;
  const appdata = vm.appCtrl.appdata;
  const noMedical = !vm.appCtrl.hasMedical;
  const noDental = !vm.appCtrl.hasDental;
  const noMedDeps = !vm.appCtrl.hasMedDependents;
  const noDenDeps = !vm.appCtrl.hasDenDependents;
  let depMedZero = '0';
  let empMedZero = '0';
  let depDenZero = '0';
  let empDenZero = '0';
  if (!appdata.employerContribIsPct) {
    depMedZero = this.UtilsSvc.toFixedTwo(groupRules.medPremiumDepContribution.minContribDol);
    empMedZero = this.UtilsSvc.toFixedTwo(groupRules.medPremiumEmpContribution.minContribDol);
    depDenZero = this.UtilsSvc.toFixedTwo(groupRules.denPremiumDepContribution.minContribDol);
    empDenZero = this.UtilsSvc.toFixedTwo(groupRules.denPremiumEmpContribution.minContribDol);
  }
  if (noMedical) {
    appdata.medPremiumEmpContribution = empMedZero;
    appdata.medPremiumDepContribution = depMedZero;
  }
  if (noDental) {
    appdata.denPremiumEmpContribution = empDenZero;
    appdata.denPremiumDepContribution = depDenZero;
  }
  angular.isFunction(callback) && callback({ callback: true });
}
