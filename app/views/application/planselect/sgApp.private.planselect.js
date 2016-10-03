import angular from 'angular';

/*************************************************
** Private functions for the PlanSelect service **
*************************************************/

/************************************************
** Computed variables set by watches or events **
************************************************/

export function checkDOCountExceedsDental(vm, doRatesArr, dentalRatesArr) { //called bound to the PlanSelectSvc, for other services, etc
  //get the original totals and filter the object to an array
  const denErollmentsArr = this.toArrayFilter(vm.appdata.groupPlan.categories.dental.enrollments, false);
  angular.forEach(denErollmentsArr, (count, idx) => {
    const dentalCount = parseInt(count, 10);
    const doCount = parseInt(doRatesArr[idx].count, 10);
    doRatesArr[idx].exceedsAllowedCount = false;
    if (doCount > dentalCount) {
      doRatesArr[idx].exceedsAllowedCount = true;
    }
  });
}

/***************************
** Rules and placeholders **
***************************/

export function generateMaxRule(vm, maxRule) {
  const rules = vm.appCtrl.rules;
  const medOnly = vm.medicalOnly;
  const denOnly = vm.dentalOnly;
  //TODO - debug, because I can't tell why medOnly and denOnly are values I set to false and have no ties to anything that changes them
  return medOnly ? rules.groupPlanRules[maxRule].medicalOnly : 
    denOnly ? rules.groupPlanRules[maxRule].medicalOnly :
    rules.groupPlanRules[maxRule].medicalPlusDental
}

export function generatePlaceholder(vm, rule) {
  return vm.rules[rule] > 1 ? 'Select up to ' + vm.rules[rule] : 'Select one';
}

/*********************************************************************
** Helpers for setting up plan rates and counts array for the table **
*********************************************************************/

//called from addTableRateCategories
//used to add rate category names
export function assignRateKeyName(payloadName) { 
  switch (payloadName) {
    case 'ecRate': 
      return 'EE + child';
    case 'efRate':
      return 'EE + family';
    case 'esRate':
      return 'EE + spouse';
    case 'eeRate': 
      return 'EE only';
    default:
      return 'EE only';
  }
}

export function addTableRateCategories(vm, plan, opt) {
  //adding rates array from separate rate values
  //TODO - evaluate whether this needs to be an array of objects, if order is an issue
  //may need to alpha order for consistency
  const option = opt || {};
  const rateRegEx = this.REGEXS.planRate;
  const countRegEx = this.REGEXS.planCount;
  const setRates = !option.forTableHeaders && (!plan.rates || (angular.isArray(plan.rates) && plan.rates.length === 0));
  const setTableHeaders = option.forTableHeaders;
  const countsObj = {};

  if (setTableHeaders || setRates) {
    if (setTableHeaders) {
      vm.rateTypes = [];
    }
    if (!setTableHeaders && setRates) {
      plan.rates = [];
    }
    let ratesIdx = 0;
    let rateTypesIdx = 0;
    angular.forEach(plan, (val, key) => {
      if (setTableHeaders) {
        if (rateRegEx.test(key)) {
          vm.rateTypes[rateTypesIdx] = {displayName: assignRateKeyName(key)};
          rateTypesIdx += 1;
        }
      }
      if (setRates) {
        if (rateRegEx.test(key)) {
          plan.rates[ratesIdx] = {
            name: key,
            value: val
          };
          ratesIdx += 1;
        }
        if (countRegEx.test(key)) { //this block is used to set an object to be used in the next loop to set counts
          const rateKey = key.replace(/plancount/i, 'Rate'); //the name with the suffix 'Rate' is used by the next loop to set the value
          countsObj[rateKey] = val;
        }
      }
    });
    if (setRates) {
      angular.forEach(plan.rates, (ratesObj, idx) => {
        const valToParse = countsObj[ratesObj.name];
        ratesObj.count = valToParse && !isNaN(parseInt(valToParse, 10)) ? parseInt(valToParse, 10) : 0;
      });
    }
  }
}

//set max allowed values for DO dental plans
export function addDOMaxCounts(vm, plan) {
  if (plan && angular.isArray(plan.rates)) {
    const denErollmentsArr = this.toArrayFilter(vm.appdata.groupPlan.categories.dental.enrollments, false);
    angular.forEach(denErollmentsArr, (count, idx) => {
      plan.rates[idx].maxCount = parseInt(denErollmentsArr[idx], 10);
    });
  } 
}

/******************************************************
** Setting values used in the rate caculations table **
******************************************************/

export function setTableValues(vm) { //'this' is being passed from PlanSelectSvc class, binding all injected services, etc
  const planCategories = vm.appCtrl.appdata.groupPlan.categories;
  const initialMedEnrollments = planCategories.medical.enrollments;
  const initialDenEnrollments = planCategories.dental.enrollments;
  const selectedMedPlans = vm.plans.medical.selected;
  const selectedDenPlans = vm.plans.dental.selected;
  let samplePlan;
  let medEnrollVal = 0;
  let denEnrollVal = 0;
  angular.forEach(vm.appdata.groupPlan.categories, (planType) => { //use the clone of appdata for view-specific properties
    if (planType.plans[0]) { //set samplePlan to the first of whichever major category has at least one plan
      samplePlan = planType.plans[0];
    }
  }, this);
  //add an array of rate objects for the view
  //grab the first available plan and use its rates keys and values to create a generic rates object array for the table headers
  addTableRateCategories.apply(this, [vm, samplePlan, {forTableHeaders: true}]); //pass context, binding all injected services, etc
      
  //populate initial enrollment totals
  if (selectedMedPlans && selectedMedPlans.length === 1) {
    angular.forEach(initialMedEnrollments, (val, prop) => {
      const enrollNum = val ? val : 0;
      medEnrollVal += parseInt(enrollNum, 10);
    });
    vm.plans.medTotalEnrollment = medEnrollVal.toString();
  }

  if (selectedDenPlans && selectedDenPlans.length > 0 && !vm.plans.denTotalEnrollment) { //condition includes that this isn't already defined
    angular.forEach(initialDenEnrollments, (val, prop) => {
      const enrollNum = val ? val : 0;
      denEnrollVal += parseInt(enrollNum, 10);
    })
    vm.plans.initialDenTotalEnrollment = vm.plans.denTotalEnrollment = denEnrollVal.toString();
  }

  //set some convenience values - TODO - break out and get rules to apply here
  vm.medRider = vm.appCtrl.groupOR ? //assumes a rule about who gets what riders, may also apply to populate plans
    vm.plans.medical.riders.vis.selected[0] : 
    vm.appCtrl.groupAK ? 
    vm.plans.medical.riders.he.selected[0] : 
    false;

  vm.denRider = vm.plans.dental.riders.orth.selected.length > 0 ? vm.plans.dental.riders.orth.selected[0] : false;

  vm.showTable = true; //set to false before a plan is selected in the component controller
}

//Deal with one of the controller's selected plan arrays being nullified - reset to empty array
function checkAndResetSelectedPlanObjects(vm, isRider, isDOPlan, planType, planTypeName) {
  if (!angular.isArray(vm.plans[planTypeName].selected) && !isRider && !isDOPlan) {
    vm.plans[planTypeName].selected = [];
  }
}

/*****************************
** Manage Enrollment Counts **
*****************************/

/*copy enrollments from the primary plan properties (eg, eePlanCount, etc) 
to the count property in the view-specific rates array, in each "rateType" object*/
function copyUpdatedCounts(plan) {
  this.$log.debug('THE PLAN CALLED WITHIN COPYUPDATED COUNTS');
  this.$log.debug(plan);
  if (angular.isArray(plan.rates)) {
    angular.forEach(plan.rates, (rateObj) => {
      const planKey = rateObj.name.replace((/rate/i), 'PlanCount');
      const count = parseInt(rateObj.count, 10);
      plan[planKey] = count; //copy the count to the payload data
      rateObj.count = count; //transform the string to a number in the view data
    });
    this.$log.debug(plan.rates);
  }
}

//map category enrollments to the plan itself (not the rates array)
//subtract direct option dental enrollments when required (for delta dental and delta dental riders)
function mapCategoryEnrollmentsToPlan(vm, plan, option) {
  const subtractDO = option && option.subtractDO ? option.subtractDO : false;
  const categoryEnrollmentObj = vm.appdata.groupPlan.categories[this.getPlanCategory(plan)].enrollments;
  let doPlan;
  let doPlanRateObj;

  if (categoryEnrollmentObj) {
    if (subtractDO) {
      doPlan = vm.plans.dental.directOption.selected[0];
    }
    if (doPlan && this.UtilsSvc.isArrayOfOneOrMore(doPlan.rates)) {
      doPlanRateObj = {};
      angular.forEach(doPlan.rates, (rateObj) => {
        doPlanRateObj[rateObj.name.replace(/rate/i, 'PlanCount')] = parseInt(rateObj.count, 10);
      });
    }
    angular.forEach(categoryEnrollmentObj, (val, key) => {
      const countName = key.replace(/count/i, 'PlanCount');
      plan[countName] = val;
      if (subtractDO && doPlanRateObj) {
        plan[countName] = val - doPlanRateObj[countName];
      }
    });
  }
}

//Set all enrollment counts to zero, on the primary object props and in the view-only rateType objects, if they exist
function zeroEnrollments(plan) {
  const ratesArr = plan.rates || null;
  if (ratesArr) {
    angular.forEach(ratesArr, (ratesObj) => {
      if (angular.isDefined(ratesObj.count)) {
        ratesObj.count = 0;
      } 
    });
  }
  for (const prop in plan) {
    if ((/plancount/i).test(prop)) {
      plan[prop] = 0;
    }
  }
}

//Handle enrollment updates when a plan is removed
function manageEnrollmentsOnRemove(vm, params) {
  //zero its enrollments
  zeroEnrollments(params.updatedPlan);
  //if a single other med plan is still selected, give it all the enrollments
  if (params.isMedPlan && params.singleMedStillSelected) { 
    mapCategoryEnrollmentsToPlan.apply(this, [vm, params.medPlanRemaining]);
    //recursively pass this plan back through the updatePlans cycle, to get enrollmments to update for the payload
    params.updatePlansFn(vm, params.medPlanRemaining, null, {remainingMedPlanUpdate: true}); 
  }
  //if we're removing a delta dental DO plan, remove enrollments from the DO plan, too
  if (params.isDualDenPrimary) { 
    const associatedDO = vm.plans.dental.directOption.selected[0];
    if (associatedDO) {
      zeroEnrollments(associatedDO);
      //need to recursively call updatePlans on this DO plan
      this.updatePlans(vm, associatedDO);
    }
  }
}

/*Handle enrollment updates when a plan is added or updated,
with specific conditions to prevent changes propagated from the validations happening on keyup
as the user updates enrollments within plans (ie, not on )
*/
function manageEnrollmentsOnUpdateOrAdd(vm, params) {
  if (params.isRider) {
    //copy medical riders enrollments from category enrollments
    //the enrollments may be split among plans, but the totals should be the same
    if (params.isDenPlan && params.dualPlanPrimaryAlreadySelected) { 
      mapCategoryEnrollmentsToPlan.apply(this, [vm, params.updatedPlan, {subtractDO: params.preselectDirectOption}]);
    } else {
      mapCategoryEnrollmentsToPlan.apply(this, [vm, params.updatedPlan]);
    }
  }
  if (params.isMedPlan) {
    if (params.singleMedStillSelected) {
      //map the category enrollments to the single new medical plan being added
      mapCategoryEnrollmentsToPlan.apply(this, [vm, params.updatedPlan]);
    } else {
      //zero out enrollments for newly added medical plans in a multiple med plan scenario
      zeroEnrollments(params.updatedPlan);
    }
  }
  if (params.isDenPlan) {
    if (params.isDualDenPrimary) {
      mapCategoryEnrollmentsToPlan.apply(this, [vm, params.updatedPlan, {subtractDO: params.preselectDirectOption}]);
    } else {
      mapCategoryEnrollmentsToPlan.apply(this, [vm, params.updatedPlan]);
    }
  }
}

//figure out which plan enrollments to zero out and which to copy from category enrollments 
function determineEnrollentsToCopyOrWipe(vm, params) {
  //if the plan being updated is to be removed
  if (params.removeThisPlan) {
    manageEnrollmentsOnRemove.apply(this, [vm, params]);
  } else {
    //cases for re-mapping plan counts using the category enrollments, with or without deduction of DO enrollments
    manageEnrollmentsOnUpdateOrAdd.apply(this, [vm, params]);
  }
}

//plansToUpdate are in the application object from the payload - to be saved
//planTypeName is the plan category (med, den)
//updatedPlan is the controller (modified-for-the-view) copy of the plan that needs to be updated on the payload object
//'this' is being passed from PlanSelectSvc class, binding all injected services, etc
export function updatePlan(vm, plansToUpdate, planTypeName, updatedPlan, callback, option) {
  //alias values bound using 'this' from the calling function
  const re = this.REGEXS;
  const updatePlansFn = this.updatePlans; //updatePlans is reflectively called again by clearRiders, when needed (see below)
  const $timeout = this.$timeout;
  const hasRatesArr = this.UtilsSvc.isArrayOfOneOrMore(updatedPlan.rates);

  //convenience values to use below and as params in function calls
  const removeThisPlan = !updatedPlan.selected; //is this plan to be removed from the vm for the select (what's currently showing as selected)?
  const isRider = !!updatedPlan.isRider;
  const updatedPlanId = updatedPlan.uniqueId;
  const isDOPlan = updatedPlan.dual && this.REGEXS.directOption.test(updatedPlan.planId);
  const isDenPlan = !isRider && this.REGEXS.dental.test(updatedPlan.planCategory) && !this.REGEXS.directOption.test(updatedPlan.planId);
  const isMedPlan = !isRider && this.REGEXS.medical.test(updatedPlan.planCategory);
  const isDualDenPrimary = (isDenPlan && updatedPlan.dual) && !isDOPlan; //this is a Delta plan for groups with DO
  const viewPlanToUpdate = vm.appdata.groupPlan.categories[planTypeName].plans
    .concat(vm.appdata.groupPlan.categories[planTypeName].riders)
    .filter((plan) => plan.uniqueId === updatedPlan.uniqueId)[0];
  const payloadPlanToUpdate = vm.appCtrl.appdata.groupPlan.categories[planTypeName].plans
    .concat(vm.appCtrl.appdata.groupPlan.categories[planTypeName].riders)
    .filter((plan) => plan.uniqueId === updatedPlan.uniqueId)[0];

  /*this option is passed down from the controller during the validation of medical enrollments within and across plans
  pass this on to manage enrollments functions to keep from overwriting values as the user types*/
  const validateCountsOnly = option && option.validateCountsOnly;

  /*the following values are passed as params to the functions that copy category enrollment values or wipe enrollments for plans
  as they are added or removed*/
  const preselectDirectOption = this.RulesSvc.rules.groupPlanRules.preselectDirectOption;
  //another medical plan has already been selected
  const multipleMedSelected = vm.appdata.groupPlan.categories[planTypeName].plans
    .filter((plan) => plan.selected && !plan.isRider).length > 1;
  const medPlanRemainingArr = vm.appdata.groupPlan.categories[planTypeName].plans
    .filter((plan) => plan.selected && !plan.isRider);
  const medPlanRemaining = medPlanRemainingArr[0];
  const singleMedStillSelected = medPlanRemainingArr.length === 1;
  //a Delta dental (dual) plan has already been selected
  const dualPlanPrimaryAlreadySelected = vm.appdata.groupPlan.categories.dental.plans
    .filter((plan) => plan.dual && plan.selected && !this.REGEXS.directOption.test(plan.planId)).length > 0;

  const remainingMedPlanUpdate = option && option.remainingMedPlanUpdate;

  // if (!hasRatesArr) {
  //   addPlanViewValues.apply(this, [vm, updatedPlan, {isDOPlan: isDOPlan}]);
  // }

  const planParams = { //an object to pass to other functions
    updatedPlan,
    removeThisPlan,
    isRider,
    isDenPlan,
    isMedPlan,
    isDOPlan,
    isDualDenPrimary,
    planTypeName,
    updatePlansFn,
    preselectDirectOption,
    multipleMedSelected,
    medPlanRemaining,
    singleMedStillSelected,
    dualPlanPrimaryAlreadySelected
  };

  if (!validateCountsOnly) { //do not call any of this if triggered by the user keying in enrollment values
    determineEnrollentsToCopyOrWipe.apply(this, [vm, planParams]);
  }

  //before wiping view values, copy new enrollment counts bound to view-only objects back to their respective payload plan properties
  //if they aren't already copied
  //HOWEVER, do not do this if the plan being updated is the remaining medical plan when others have been removed - will overwrite new values
  if (!(removeThisPlan && isMedPlan && singleMedStillSelected) && !remainingMedPlanUpdate) {
    copyUpdatedCounts.call(this, updatedPlan);
  }

  //nullify AK plan selection if all med plans are being removed
  if (removeThisPlan && isMedPlan && medPlanRemainingArr.length === 0) {
    vm.appCtrl.appdata.alaskaNetworkSelection = null;
  }
  
  //remove values from the vm version that are used for display purposes only
  const updatedPlanCopy = removePlanViewValues(angular.copy(updatedPlan));
  
  //hacky way of resetting these lost selected arrays
  checkAndResetSelectedPlanObjects(vm, isRider, isDOPlan, updatedPlan.planType, planTypeName); 

  
  //use the copy of the updated plan to set values to the payload appdata (no view values)
  angular.copy(updatedPlanCopy, payloadPlanToUpdate);

  //do the same to the same plan in the clone of appCtrl.appdata, which is used for the select in the view
  angular.copy(updatedPlanCopy, viewPlanToUpdate);

  //filter out plans that aren't the one being selected
  filterBeforeAddBack(vm, updatedPlan, planTypeName, isRider, isDOPlan);
  
  //then, add back the selected plan with its view values
  if (!removeThisPlan) { //if this plan is added or updated
    addBackPlan.apply(this, [vm, updatedPlan, planTypeName, isRider, isDOPlan]);
  }
   
  if (!isRider && vm.plans[planTypeName].selected.length === 0) { //if the user has just emptied plans
    clearRiders(vm, planTypeName, updatePlansFn);
  }

  /*eslint callback-return: "warn"*/

  //trigger any callback
  if (callback) {
    callback(updatedPlan);
  }

  /*eslint callback-return: "warn"*/

  //allow the user to save updates
  vm.appCtrl.setEnableSubmit();
}

function filterBeforeAddBack(vm, updatedPlan, planTypeName, isRider, isDOPlan) {
  const updatedPlanId = updatedPlan.uniqueId;
  isRider ? vm.plans[planTypeName].riders[getRiderTypeName(updatedPlan.planType)].selected = 
    vm.plans[planTypeName].riders[getRiderTypeName(updatedPlan.planType)].selected
    .filter((plan) => !(plan.uniqueId === updatedPlanId)) : 
  isDOPlan ? vm.plans[planTypeName].directOption.selected = 
    vm.plans[planTypeName].directOption.selected
    .filter((plan) => !(plan.uniqueId === updatedPlanId)) : 
  vm.plans[planTypeName].selected = 
    vm.plans[planTypeName].selected
    .filter((plan) => !(plan.uniqueId === updatedPlanId));
}

function addBackPlan(vm, updatedPlan, planTypeName, isRider, isDOPlan) {
  addPlanViewValues.apply(this, [vm, updatedPlan, {isDOPlan: isDOPlan}]);
  isRider ? vm.plans[planTypeName].riders[getRiderTypeName(updatedPlan.planType)].selected.push(updatedPlan) :
    isDOPlan ? vm.plans[planTypeName].directOption.selected.push(updatedPlan) : 
    vm.plans[planTypeName].selected.push(updatedPlan);
}

export function addPlanViewValues(vm, plan, option) { //add values for view only
  //adding rates array from separate rate values
  // const populatePlans = option && option.populatePlans ? option.populatePlans : false;
  const isDOPlan = option && option.isDOPlan ? option.isDOPlan : false;
  addTableRateCategories.apply(this, [vm, plan]); //'this' is being passed from PlanSelectSvc class, binding all injected services, etc
  // if (populatePlans) { //if we're coming back to the view, some plans aren't getting values set correctly on the plan object, so copy from the rates array
  //   copyUpdatedCounts.call(this, plan);
  // }
  if (isDOPlan) {
    addDOMaxCounts.apply(this, [vm, plan]);
  }
}

export function getRiderTypeName(planType) { //checks for a rider shorthand name (from the payload enum) and LCs it for view model mapping
  if (!planType) {
    return;
  }
  const riderTypeString = planType.toLowerCase();
  return riderTypeString;
}

/***************************************************************
** Helper functions (not exported) for the PlanSelect service **
***************************************************************/


function clearRiders(vm, planTypeName, updatePlans) {
  angular.forEach(vm.plans[planTypeName].riders, (riderType) => {
    riderType.add = false;
  });
  angular.forEach(vm.plans[planTypeName].riders, (riderType) => {
    angular.forEach(riderType.selected, (rider) => { 
      rider.selected = false;
      updatePlans(vm, rider);
    });
    if (angular.isArray(riderType.selected)) {
      riderType.selected = [];
    }
  });
}

/**************************************************************
** Add and remove view values from payload object, as needed **
**************************************************************/

function removePlanViewValues(plan) { //remove extra values for view only
  delete plan.rates;
  delete plan.subtotalArr;
  delete plan.medPlanSubtotal;
  delete plan.totalCount;
  delete plan.planTotalCount;
  delete plan['_uiSelectChoiceDisabled'];
  return plan;
}

/****************
** Get Service **
****************/

function getService(serviceName) {
  if (angular.isString(serviceName)) {
    const $injector = angular.element(document).find('body')
      .injector();
    const svc = $injector.get(serviceName);
    return svc ? svc : false;
  }
}

