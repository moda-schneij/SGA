'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:planselect
 * @description
 * # PlanSelect
 * Service of the Small Group Application app
 */
 
import angular from 'angular';
import sgAppRoot from '../../../root/sgApp.component.root'; //this service is defined on the root module and injected there
import { 
  generateMaxRule, 
  generatePlaceholder, 
  assignRateKeyName,
  addTableRateCategories,
  createSidebarObj,
  setTableValues, 
  updatePlan,
  addPlanViewValues,
  checkDOCountExceedsDental,
  getRiderTypeName,
  addDOMaxCounts
} from './sgApp.private.planselect';

class PlanSelectSvc {

  /*@ngInject*/
  constructor($log, UtilsSvc, ApplicationSvc, OptionsSvc, RulesSvc, $rootScope, $timeout, $window, REGEXS, toArrayFilter) {
    this.$log = $log;
    this.UtilsSvc = UtilsSvc;
    this.ApplicationSvc = ApplicationSvc;
    this.OptionsSvc = OptionsSvc;
    this.RulesSvc = RulesSvc;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$window = $window;
    this.REGEXS = REGEXS;
    this.toArrayFilter = toArrayFilter;
    this.updatePlans = this.updatePlans.bind(this);
    this.anyPlansAdded = this.anyPlansAdded.bind(this);
    this.getPlanCategory = this.getPlanCategory.bind(this);
    this.computeDentalTotals = this.computeDentalTotals.bind(this);
  }

  /**********************
  ** Get plan category **
  **********************/

  getPlanCategory(plan) {
    return this.REGEXS.medical.test(plan.planCategory) ? 'medical' : 'dental';
  }

  setStaticValues(vm) {
    vm.rateNamesArr = Object.keys(vm.appCtrl.appdata.groupPlan.categories.medical.enrollments)
      .map((name) => name.replace('Count', 'Rate'));
  }

  /*************************************
  ** Create controller computed props **
  *************************************/

  setComputedProps(vm, vmVars) {
    //computed properties
    const re = this.REGEXS;
    const utils = this.UtilsSvc;
    const denPlans = vmVars && vmVars.denPlans;
    const medPlans = vmVars && vmVars.medPlans;

    Object.defineProperty(vm.plans.medical.riders, 'selected', {
      get: () => {
        let returnArr = [];
        Object.keys(vm.plans.medical.riders).filter((key) => !(/selected/i).test(key))
          .forEach((key) => {
            if (angular.isArray(vm.plans.medical.riders[key].selected) && vm.plans.medical.riders[key].selected.length > 0) {
              returnArr = returnArr.concat(vm.plans.medical.riders[key].selected);
            }
          });
        return returnArr;
      },
      enumerable: true,
      confiurable: true
    });

    Object.defineProperty(vm.plans, 'minPlansSelected', {
      get: () => (vm.appCtrl.rules.groupPlanRules.dentalOnlyAllowed && 
        angular.isArray(vm.plans.dental.selected) && vm.plans.dental.selected.length > 0) || 
        (angular.isArray(vm.plans.medical.selected) && vm.plans.medical.selected.length > 0),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'showVisionRider', {
      get: () => vm.rules.maxMed > 0 && 
        vm.rules.maxVis > 0 && 
        vm.plans.medical.selected && 
        vm.plans.medical.selected.length > 0 && 
        medPlans && medPlans.riders.filter((rider) => re.vision.test(rider.planType)).length > 0,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'showHearingRider', {
      get: () => vm.rules.maxMed > 0 && 
        vm.rules.maxHe > 0 && 
        vm.plans.medical.selected && 
        vm.plans.medical.selected.length > 0 && 
        medPlans && medPlans.riders.filter((rider) => re.hearing.test(rider.planType)).length > 0,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'showOrthoRider', {
      get: () => vm.rules.maxDen > 0 && 
        vm.rules.maxOrth > 0 && 
        vm.plans.dental.selected && 
        vm.plans.dental.selected.length > 0 && 
        denPlans && denPlans.riders.filter((rider) => re.orthodontia.test(rider.planType)).length > 0,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'showDirectOption', { //test that there's a selected dual dental (delta) whose planId is NOT 'WDG'
      get: () => vm.rules.maxDen > 0 && 
        vm.plans.dental.selected && 
        vm.plans.dental.selected.length > 0 && 
        vm.plans.dental.selected.filter((plan) => plan.dual && !re.directOption.test(plan.planId)).length > 0,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'directOptionPlanName', {
      get: () => {
        //find the selected dental plan and filter on dual and NOT WDG, then find the associated WDG
        const selectedDen = vm.plans.dental.selected && 
          vm.plans.dental.selected.length > 0 && 
          vm.plans.dental.selected.filter((plan) => plan.dual && !re.directOption.test(plan.planId))[0];
        if (selectedDen) {
          const thisDOPlan = denPlans.plans.filter((plan) => plan.dualId === selectedDen.dualId && 
            re.directOption.test(plan.planId))[0];
          return thisDOPlan ? thisDOPlan.planName : '';
        }
        return '';
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'showDental', {
      get: () => denPlans && denPlans.plans.length > 0,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'showMedical', {
      get: () => medPlans && medPlans.plans.length > 0,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'multiMed', {
      get: () => angular.isArray(vm.plans.medical.selected) && vm.plans.medical.selected.filter((plan) => plan.selected).length > 1,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'singleMed', {
      get: () => angular.isArray(vm.plans.medical.selected) && vm.plans.medical.selected.filter((plan) => plan.selected).length === 1,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'doTotalEnrollment', {
      get: () => {
        const vmDOPlan = angular.isArray(vm.plans.dental.directOption.selected) ? vm.plans.dental.directOption.selected[0] : null;
        if (vmDOPlan) {
          return vmDOPlan.rates.reduce((prevVal, currRateTypeObj) => { //iterate thru the rates array of the vm's selected directOption plan and add the counts
            const count = this.UtilsSvc.isNumber(this.UtilsSvc.parseNums(currRateTypeObj.count)) ? 
              this.UtilsSvc.parseNums(currRateTypeObj.count) : 0;
            return count + prevVal;
          }, 0);
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'doSubtotal', {
      get: () => {
        const vmDOPlan = angular.isArray(vm.plans.dental.directOption.selected) ? vm.plans.dental.directOption.selected[0] : null;
        if (vmDOPlan && angular.isArray(vmDOPlan.rates)) {
          const doSubtotalVal = vmDOPlan.rates.reduce((prevVal, currRateTypeObj) => {
            const count = this.UtilsSvc.isNumber(this.UtilsSvc.parseNums(currRateTypeObj.count)) ? 
              this.UtilsSvc.parseNums(currRateTypeObj.count) : 0;
            const value = this.UtilsSvc.isNumber(this.UtilsSvc.parseFloats(currRateTypeObj.value)) ? 
              this.UtilsSvc.parseFloats(currRateTypeObj.value) : 0;
            return (count * value) + prevVal;
          }, 0);
          return parseFloat(doSubtotalVal);
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'doSubtotalsArr', {
      get: () => {
        const vmDOPlan = this.UtilsSvc.isArrayOfOneOrMore(vm.plans.dental.directOption.selected) ? vm.plans.dental.directOption.selected[0] : null;
        if (vmDOPlan && angular.isArray(vmDOPlan.rates)) {
          return vmDOPlan.rates
            .map((rateTypeObj) => {
              const count = this.UtilsSvc.isNumber(this.UtilsSvc.parseNums(rateTypeObj.count)) ? 
                this.UtilsSvc.parseNums(rateTypeObj.count) : 0;
              const value = this.UtilsSvc.isNumber(this.UtilsSvc.parseFloats(rateTypeObj.value)) ? 
                this.UtilsSvc.parseFloats(rateTypeObj.value) : 0;
              return parseFloat(count * value)
            });
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'denTotalEnrollment', {
      get: () => {
        const vmDenPlan = this.UtilsSvc.isArrayOfOneOrMore(vm.plans.dental.selected) ? vm.plans.dental.selected[0] : null;
        if (vmDenPlan) {
          return vmDenPlan.rates.reduce((prevVal, currRateTypeObj) => {
            const count = this.UtilsSvc.isNumber(this.UtilsSvc.parseNums(currRateTypeObj.count)) ? 
              this.UtilsSvc.parseNums(currRateTypeObj.count) : 0;
            return count + prevVal;
          }, 0);
        } else {
          return 0;
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'denSubtotalsArr', {
      get: () => {
        const returnArr = [0,0,0,0];
        const vmDenPlan = this.UtilsSvc.isArrayOfOneOrMore(vm.plans.dental.selected) ? vm.plans.dental.selected[0] : null;
        //hard-coding the rider type here, in case this every changes. The rider is always 'orth'
        //did not want to waste time or resources trying to actually parse the riderType name
        const vmDenRider = angular.isArray(vm.plans.dental.riders.orth.selected) ? vm.plans.dental.riders.orth.selected[0] : null;
        const hasVmDenRiderRates = vmDenRider && this.UtilsSvc.isArrayOfUsableIterables(vmDenRider.rates);
        if (vmDenPlan && this.UtilsSvc.isArrayOfUsableIterables(vmDenPlan.rates)) {
          angular.forEach(vmDenPlan.rates, (rateTypeObj, idx) => {
            let riderVal = 0;
            if (hasVmDenRiderRates) {
              riderVal = this.UtilsSvc.isNumber(this.UtilsSvc.parseFloats(vmDenRider.rates[idx].value)) ? 
                this.UtilsSvc.parseFloats(vmDenRider.rates[idx].value) : 0;
            }
            const count = this.UtilsSvc.isNumber(this.UtilsSvc.parseNums(rateTypeObj.count)) ? 
              this.UtilsSvc.parseNums(rateTypeObj.count) : 0;
            const value = this.UtilsSvc.isNumber(this.UtilsSvc.parseFloats(rateTypeObj.value)) ? 
              this.UtilsSvc.parseFloats(rateTypeObj.value) : 0;
            returnArr[idx] = count * (value + riderVal);
          });
        }
        return returnArr;
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'denSubtotal', {
      get: () => {
        if (angular.isArray(vm.denSubtotalsArr)) {
          return vm.denSubtotalsArr.reduce((prevVal, currVal) => (prevVal + currVal), 0);
        }
        return 0;
      },
      enumerable: true,
      configurable: true
    });
    

    /******************************************
    ** Big, fat set of medical computed vals **
    ******************************************/

    //sets the following:
    //the plan-specific subtotals
    //the combined plan subtotal
    //the total count for each of multiple plans
    //the totals array for medical
    Object.defineProperty(vm, 'medSubtotal', { 
      get: () => {
        let medSubtotalVal = 0;
        const medSubtotalsArr = [];
        const UtilsSvc = this.UtilsSvc;
        const vmMedPlans = this.UtilsSvc.isArrayOfOneOrMore(vm.plans.medical.selected) && vm.plans.medical.selected;
        const medEnrollments = vm.appdata.groupPlan.categories.medical.enrollments;
        const selMedRiders = vm.appCtrl.appdata.groupPlan.categories.medical.riders.filter(
          (rider) => rider.selected
        );
        vm.medSubtotalsArr = []; //create a new vm subtotals array for medical
        angular.forEach(medEnrollments, () => {
          vm.medSubtotalsArr.push(0); //set all starting values to 0, to enable accumulation of value
        });
        if (vmMedPlans) {
          const singlePlan = vmMedPlans.length === 1;
          angular.forEach(vmMedPlans, (medPlan, idx) => {
            medSubtotalsArr[idx] = [];
            let planTotalCount = 0;
            let subtotalIdx = 0;
            if (UtilsSvc.isArrayOfOneOrMore(medPlan.rates)) {
              const thisMedSubtotal = medPlan.rates.reduce((prevVal, currRateTypeObj) => {
                const countName = currRateTypeObj.name.replace(/rate/i, 'Count'); //property used to filter the med category enrollments for a single plan
                const count = singlePlan ? 
                  (UtilsSvc.isNumber(UtilsSvc.parseNums(medEnrollments[countName])) ? 
                    UtilsSvc.parseNums(medEnrollments[countName]) : 0) :
                  (UtilsSvc.isNumber(UtilsSvc.parseNums(currRateTypeObj.count)) ? 
                    UtilsSvc.parseNums(currRateTypeObj.count) : 0);
                const value = UtilsSvc.isNumber(UtilsSvc.parseFloats(currRateTypeObj.value)) ? 
                  UtilsSvc.parseFloats(currRateTypeObj.value) : 0;
                planTotalCount += count; //also set the plan's total count
                 //also set the rateType subtotal
                currRateTypeObj.rateTypeSubtotal = count * value;
                //factor in riders
                if (UtilsSvc.notNullOrEmptyObj(selMedRiders[0])) {
                  selMedRiders.forEach((rider) => {
                    currRateTypeObj.rateTypeSubtotal += count * rider[currRateTypeObj.name];
                  });
                }
                medSubtotalsArr[idx][subtotalIdx] = currRateTypeObj.rateTypeSubtotal;
                subtotalIdx += 1;
                //do final totals
                let newVal = count * value;
                //factor in riders
                if (UtilsSvc.notNullOrEmptyObj(selMedRiders[0])) {
                  selMedRiders.forEach((rider) => {
                    newVal += count * rider[currRateTypeObj.name];
                  });
                }
                return newVal + prevVal;
              }, 0);
              medPlan.planTotalCount = parseInt(planTotalCount, 10); //also set the plan's total count
              medPlan.medPlanSubtotal = parseFloat(thisMedSubtotal); //also set the plan's subtotal
              medSubtotalVal += parseFloat(thisMedSubtotal);
            }
          });
          //set the new totals array for medical, which is one total value for each ratetype
          angular.forEach(medSubtotalsArr, (planSubtotalsArr) => {
            angular.forEach(planSubtotalsArr, (value, valIdx) => { 
              vm.medSubtotalsArr[valIdx] += value; 
            });
          });
          return medSubtotalVal;
        }
      },
      enumerable: true,
      configurable: true
    });

    // Object.defineProperty(vm, 'totalsArr', {
    //   get: () => {
    //     const medSubtotals = vm.medSubtotalsArr ? vm.medSubtotalsArr : [0,0,0,0];
    //     return medSubtotals;
    //   },
    //   enumerable: true,
    //   configurable: true
    // });

    //check whether group has members in AK, for displaying AK network radios
    //if this comes at the top of the computed props or maybe just before the medSubtotal computed, it breaks all of those
    //don't know why at this time, particularly since the data points aren't related and filter does not mutate anything
    Object.defineProperty(vm, 'groupHasAKMembers', {
      get: () => vm.appCtrl.appdata.additionalState.filter((selectedState) => 
          selectedState.state === 'AK' && selectedState.noOfEmpPerState > 0)
          .length > 0,
      enumerable: true,
      configurable: true
    });

    //test values
    Object.defineProperty(vm, 'selectedPlans', {
      get: () => vm.appCtrl.appdata.groupPlan.categories.medical.plans.filter((plan) => plan.selected)
        .concat(vm.appCtrl.appdata.groupPlan.categories.dental.plans.filter((plan) => plan.selected),
          vm.appCtrl.appdata.groupPlan.categories.medical.riders.filter((plan) => plan.selected), 
          vm.appCtrl.appdata.groupPlan.categories.dental.riders.filter((plan) => plan.selected)),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'selectedMedPlans', {
      get: () => vm.appCtrl.appdata.groupPlan.categories.medical.plans.filter((plan) => plan.selected),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'selectedMedRiders', {
      get: () => vm.appCtrl.appdata.groupPlan.categories.medical.riders.filter((plan) => plan.selected),
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(vm, 'combinedMedRiderRates', {
      get: () => {
        const returnObj = {};
        vm.selectedMedRiders.forEach((rider) => Object.keys(rider).forEach((key) => {
          if ((/rate/i).test(key)) {
            returnObj[key] = isNaN(returnObj[key]) ? 0 : returnObj[key];
            returnObj[key] += rider[key];
          }
        }));
        return this.toArrayFilter(returnObj);
      },
      enumerable: true,
      configurable: true
    });
  }

  /***********************************
  ** Set Up Options for Plan Select **
  ***********************************/

  setOptions(vm) {
    //enum for AK network selection
    vm.akMedNetworks = this.OptionsSvc.options.alaskaMedicalNetworks;
    angular.forEach(vm.akMedNetworks, (network) => {
      network.id = 'aknetwork' + network.value.toLowerCase(); //aknetworkes or aknetworkep (as long at they are distinct, we're good)
    });
  }

  /*********************************
  ** Set Up Rules for Plan Select **
  *********************************/

  setRules(vm) {
    const maxMed = generateMaxRule(vm, 'maximumMedical');
    const maxDen = generateMaxRule(vm, 'maximumDental');
    const maxVis = generateMaxRule(vm, 'maximumVisionRider');
    const maxOrth = generateMaxRule(vm, 'maximumOrthoRider');
    const maxHe = generateMaxRule(vm, 'maximumHearingRider');
    vm.rules = {
      maxMed: maxMed,
      maxDen: maxDen,
      maxVis: maxVis,
      maxOrth: maxOrth,
      maxHe: maxHe
    };
    vm.placeholders = {
      dental: generatePlaceholder(vm, 'maxDen'),
      medical: generatePlaceholder(vm, 'maxMed')
    };
  }

  checkMaxPlans(vm, planType) {
    const isMed = (/med/).test(planType.toLowerCase());
    const typeToTest = isMed ? 'medical' : 'dental';
    const maxRule = isMed ? 'maxMed' : 'maxDen';
    return !(vm.plans[typeToTest].selected.length < this.vm.rules[maxRule]);
  }

  /***************************************************
  ** Determine whether any plans have been selected **
  ***************************************************/

  anyPlansAdded(vm) {
    return this.$timeout(returnFn.bind(this), 500); //need a delay to deal with ui debounce settings
    function returnFn() {
      const medPlans = vm.appCtrl.appdata.groupPlan.categories.medical.plans;
      const denPlans = vm.appCtrl.appdata.groupPlan.categories.dental.plans;
      const returnArr = [].concat(denPlans, medPlans).filter((plan) => plan.selected);
      vm.noPlansSelected = returnArr.length === 0;
      setTableValues.call(this, vm); //pass context to the private function, binding services, etc
    }
  }
  
  /*****************************************
  ** Populate and update plans and riders **
  *****************************************/

  populatePlans(vm, vmVars) { //puts selected plans back on init
    let planCategory = '';
    let riderTypeName = '';
    const re = this.REGEXS;
    const plansObj = vmVars && vmVars.plansObj;
    const denPlans = vmVars && vmVars.denPlans;
    const selectedPlans = plansObj.medical.plans.concat(plansObj.medical.riders, plansObj.dental.plans, plansObj.dental.riders)
      .filter((plan) => plan.selected);
    //TODO - figure out a pattern for using clones to keep the payload clean - will involve funniness in the view
    //Cloning to avoid mutating the payload object
    const plansClone = angular.copy(plansObj);
    angular.forEach(plansClone, loopPlanType, this); //iterate over the plan categories from the app object
    function loopPlanType(planType, planTypeName) {
      planCategory = planTypeName;
      vm.plans[planTypeName].selected = []; //empty the vm's selected plan array to push in only the selected ones
      //be sure to pass context into each call to angular.forEach
      angular.forEach(vm.plans[planCategory].riders, (riderType) => {
        riderType.add = false;
      }); //clear riders
      angular.forEach(planType.plans.concat(planType.riders), loopPlans, this); //for each plan or rider in the category, loop plans
    }
    function loopPlans(plan, planType) {
      //call private fns passing context, binding services, etc
      addPlanViewValues.apply(this, [vm, plan, {populatePlans: true}]); //adding values to the selected plan -- these values will break save/submit, so need to be stripped
      if (plan.selected) { //if this is a selected plan (and not a DO plan?)
        if (plan.isRider) { //fork behavior depending on whether this is a primary plan or rider
          riderTypeName = getRiderTypeName(plan.planType);
          vm.plans[planCategory].riders[riderTypeName].selected.push(plan); //push this rider to the vm's rider array
          vm.plans[planCategory].riders[riderTypeName].add = true; //trigger select if there are selected riders
        } else {
          if (!re.directOption.test(plan.planId)) {
            vm.plans[planCategory].selected.push(plan); //push this plan to the vm's selected plan array (for the correct plan type)
          } else { //if this is a DO plan, push to the direct option view array

            vm.plans[planCategory].directOption.selected.push(plan);
            addDOMaxCounts.apply(this, [vm, plan]); //set the max allowed counts on DO plans
          }
        }
      }
    }
  }

  //update appdata plans when a plan is selected or deselected on the controller's (vm's) object
  updatePlans(vm, updatedPlan, callback, option) { //here's the plan to update on the app model and vm
    const isRider = !!updatedPlan.isRider;
    //determine the category of plan - also applies to riders
    const updatedPlanType = updatedPlan.planCategory.toLowerCase() === 'med' ? 'medical' : 'dental';
    const plansObj = vm.appCtrl.appdata.groupPlan.categories;
    angular.forEach(plansObj, (planType, planTypeName) => { //iterate over the plan categories from the app object
      if (planTypeName === updatedPlanType) {
        const plansToUpdate = isRider ? planType.riders : planType.plans;
        // pass the REGEXS constant obj and the contructor reference to this method to the child function for a reflection callback
        updatePlan.apply(this, [vm, plansToUpdate, planTypeName, updatedPlan, callback, option]);
        //passing the payload plans array that needs to be updated as "plansToUpdate"
      }
    }, this);
    this.anyPlansAdded(vm);
  }

  updateDeltaDentalPlan(vm) {
    const deltaPlan = vm.plans.dental.selected[0];
    const doPlan = vm.plans.dental.directOption.selected[0];
    this.computeDentalTotals(vm, {deltaPlan: true});
    if (deltaPlan) {
      this.updatePlans(vm, deltaPlan);
    }
    this.updatePlans(vm, doPlan);
  }

  /***************************
  ** Compute dental totals **
  ***************************/

  computeDentalTotals(vm, option) {
    const deltaPlan = option && option.deltaPlan ? option.deltaPlan : false;
    const toArrayFilter = this.toArrayFilter;
    const UtilsSvc = this.UtilsSvc;
    const $log = this.$log;
    const doPlan = vm.plans.dental.directOption.selected[0];
    const dentalPlan = vm.plans.dental.selected[0];
    const dentalEnrollments = this.toArrayFilter(vm.appdata.groupPlan.categories.dental.enrollments, false);
    const doRatesArr = doPlan && angular.isArray(doPlan.rates) ? doPlan.rates : null;
    const dentalRatesArr = angular.isArray(dentalPlan.rates) ? dentalPlan.rates : null;

    //recalculate delta plan enrollments based on changed DO plan counts
    if (deltaPlan && dentalEnrollments && UtilsSvc.isArrayOfOneOrMore(doRatesArr) && UtilsSvc.isArrayOfOneOrMore(dentalRatesArr)) {
      angular.forEach(doRatesArr, (rateObj, idx) => {
        dentalRatesArr[idx].count = parseInt(dentalEnrollments[idx], 10) - parseInt(rateObj.count, 10);
      });
    }

    //update the total enrollment figure based on how many DO plan enrollments are entered
    vm.plans.doTotalEnrollment = doRatesArr ? doRatesArr.reduce((p_rateObj, c_rateObj) => {
        const pCount = p_rateObj.count ? p_rateObj.count : UtilsSvc.isNumber(p_rateObj) ? p_rateObj : 0;
        const cCount = c_rateObj.count ? c_rateObj.count : UtilsSvc.isNumber(c_rateObj) ? c_rateObj : 0;
        return pCount + cCount;
      }, 0) : 0;
    vm.plans.denTotalEnrollment = doRatesArr && 
      vm.plans.doTotalEnrollment && 
      vm.plans.initialDenTotalEnrollment ? 
      vm.plans.initialDenTotalEnrollment - vm.plans.doTotalEnrollment :
      vm.plans.denTotalEnrollment ? vm.plans.denTotalEnrollment : 0;
    doRatesArr && dentalRatesArr ? checkDOCountExceedsDental.apply(this, [vm, doRatesArr, dentalRatesArr]) : angular.noop();
  }

  /***************************
  ** Compute medical totals **
  ***************************/
  //TODO - evaluate whether this needs to be used at all anymore - it may
  computeMedicalTotals(plans, vm, vmVars) {    
    //add constraints for multipleMed employee counts
    if (vm.multiMed) {
      const medEnrollments = vm.appCtrl.appdata.groupPlan.categories.medical.enrollments;
      const totalsObj = {};
      //in basic terms, the following two blocks smash down enrollment counts across plans into one object with total counts by enrollment type
      //the result is the totalsObj
      const countsArr = plans.reduce((memo, plan) => {
        const planCounts = plan && plan.rates && angular.isArray(plan.rates) && 
          plan.rates.map((ratesObj , idx) => {
            const returnObj = {};
            const name = ratesObj.name.replace(/rate/i, 'Count'); //change the substring rate to 'Count' for the comparison to work
            const count = ratesObj.count ? parseInt(ratesObj.count, 10) : 0;
            returnObj[name] = count;
            return returnObj;
          });
        return memo.concat(planCounts);
      }, []);
      angular.forEach(countsArr, (val, key) => {
        angular.forEach(val, (value, name) => {
          if (!totalsObj.hasOwnProperty(name)) {
            Object.defineProperty(totalsObj, name, {
              enumerable: true,
              configurable: true,
              value: value,
              writable: true
            });
          } else {
            totalsObj[name] += value;
          }
        });
      });
      angular.forEach(medEnrollments, 
        (enrollVal, enrollKey) => {
          const enrollKeyPrefix = enrollKey.replace(/count/i, '');
          angular.forEach(plans, (plan) => {
            const thisRateType = plan.rates.filter((rateType) => {
              const rateTypeNamePrefix = rateType.name.replace(/rate/i, '');
              return rateTypeNamePrefix === enrollKeyPrefix;
            });
            if (thisRateType && thisRateType[0]) {
              thisRateType[0].exceedsTotalCount = totalsObj[enrollKey] > enrollVal;
              thisRateType[0].lessThanTotalCount = totalsObj[enrollKey] < enrollVal;
              thisRateType[0].matchesTotalCount = totalsObj[enrollKey] === enrollVal;
            }
          });
        }
      );
    }
  }

  /********************
  ** Test plan types **
  ********************/

  isDeltaWithDO(plan) {
    return plan.dual && !this.REGEXS.directOption.test(plan.planType) && this.RulesSvc.rules.groupPlanRules.preselectDirectOption;
  }

  isPrimaryDental(plan) {
    return this.REGEXS.dental.test(plan.planCategory) && plan.isRider && !this.REGEXS.directOption.test(plan.planType);
  }
}

export default angular
  .module(sgAppRoot.name)
  .service('PlanSelectSvc', PlanSelectSvc);