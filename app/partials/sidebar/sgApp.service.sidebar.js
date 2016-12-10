'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:sidebar
 * @description
 * # Sidebar
 * Service of the Small Group Application app
 */
 
import angular from 'angular';
import sgAppRoot from '../../root/sgApp.component.root'; //this service is defined on the root module and injected there

class SidebarSvc {

  /*@ngInject*/
  constructor($log, $rootScope, $filter, ApplicationSvc, StorageSvc, UtilsSvc, STORAGE_KEYS) {
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$filter = $filter;
    this.ApplicationSvc = ApplicationSvc;
    this.populateSidebar = this.populateSidebar.bind(this);
    this.resetSidebar = this.resetSidebar.bind(this);
    this.StorageSvc = StorageSvc;
    this.UtilsSvc = UtilsSvc;
    this.SIDEBAR_KEY = STORAGE_KEYS.SIDEBAR_KEY;
  }

  initSidebar(vm) {
    this.StorageSvc.removeSessionStore(this.SIDEBAR_KEY);
    init(vm);
  }

  depopulateSidebar(vm) {
    this.StorageSvc.removeSessionStore(this.SIDEBAR_KEY);
    this.$rootScope.$evalAsync(function() {
      init(this);
    }.bind(vm));
  }

  populateSidebar(vm, newsections, option) {
    const validNewSections = newsections && angular.isArray(newsections) && newsections.length > 0 && newsections[0] && newsections[0].title;
    const update = option && option.update ? option.update : false;
    if (vm) {
      this.vm = vm;
      const existingSections = this.StorageSvc.getSessionStore(this.SIDEBAR_KEY);
      let sidebarObj = update ? getSidebarObj.call(this) : existingSections ? existingSections : getSidebarObj.call(this);
      if (sidebarObj) {
        if (validNewSections) {
          const newSecTitles = newsections.length < 2 ? 
            newsections[0].title : 
            newsections.reduce((sec1, sec2) => (sec2 ? sec1.title + ', ' + sec2.title : sec1.title));
          sidebarObj = sidebarObj.filter((section) => !newSecTitles.match(section.title)); //remove what would be a duplicate section
          sidebarObj = [].concat(sidebarObj, newsections);
        }
        if (sidebarObj.length > 0) {
          this.StorageSvc.setSessionStore(this.SIDEBAR_KEY, sidebarObj);
          const sections = vm.sections = this.ApplicationSvc.populateSections(sidebarObj); //this is used only by the sidebar component
          //for any other component calling the sidebar service, we need to broadcast an event for the root component to handle
          //this.$rootScope.$emit('sidebarUpdated', {sections: sections});
          //TODO - probably remove - sidebar should already update when appData is changed and persisted
          if (vm.setDisplaySidebar) {
            vm.setDisplaySidebar(true);
          }
        }
      }
    }
  }

  addToSidebar(vm, sectionObj) { //can handle a single object or an array of objects
    if (sectionObj) {
      if (angular.isArray(sectionObj)) {
        this.populateSidebar(vm, sectionObj)
      } 
      if (angular.isObject(sectionObj)) {
        const arr = [];
        arr.push(sectionObj);
        this.populateSidebar(vm, arr);
      }
    } else {
      this.resetSidebar();
    }
  }

  getFromSidebar(title) { //get a section from the sidebar and return it
    const existingSections = this.StorageSvc.getSessionStore(this.SIDEBAR_KEY);
    const returnSection = existingSections.filter((section) => section.title.toLowerCase() === title.toLowerCase());
    return returnSection[0]; //unwrap the array of a single section
  }

  removeFromSidebar(vm, title) {
    //stub for later work - TODO - get sidebar obj from store, find object with this title, then populate again
  }

  resetSidebar(vm) {
    this.StorageSvc.removeSessionStore(this.SIDEBAR_KEY);
    vm.sections = []; //reset all the sections
    this.populateSidebar(vm);
  }

  updateSidebar(vm) { //mostly a convenience method name, does not pass new sections to the sidebar, just updates it
    this.populateSidebar(vm, null, {update: true}); 
  }
}

function init(vm) {
  if (vm) {
    vm.sections = []; //reset the sections
    vm.setDisplaySidebar(false);
  }
}

function getSidebarObj(viewModel) { //make singleton-ish?
  const vm = viewModel ? viewModel : this.vm;
  const appData = vm.appData ? vm.appData : (vm.appCtrl && vm.appCtrl.appData) ? vm.appCtrl.appData :
      (vm.rootCtrl && vm.rootCtrl.appData) ? vm.rootCtrl.appData : this.ApplicationSvc.getApplication();
  if (this.UtilsSvc.notNullOrEmptyObj(appData)) {
    //test
    //delete appData.agentLastName; //tested, working - the agent block only shows up if that info comes from appData (SER or afterward)
    //test
    const group = appData.group;
    const addr1 = appData.group.address[1]; //this is now the primary address (?)
    const effDate = new Date(appData.effectiveDate);
    let sidebarArr = angular.fromJson([{
      "title": "Group",
      "content": {
        "Name": group.employerLegalName,
        "Employer Tax ID": group.employerTaxId,
        "Street address": !addr1.address2 ? addr1.address1 : addr1.address1 + ', ' + addr1.address2,
        "State": addr1.state,
        "City": addr1.city,
        "Zip": addr1.zip
      }
    }, {
      "title": "Quote",
      "content": {
        "ID": appData.applicationNumber, //for some reason, quoteId becomes applicationNumber between SER and SGA
        "Effective date": this.$filter('date')(effDate, 'MM/dd/yyyy')
      }
    }, {
      "title": "Application",
      "content": {
        "ID": appData.applicationId
      }
    }]);
    sidebarArr = checkSelectedPlans.apply(this, [vm, sidebarArr]);
    sidebarArr = checkAgent.apply(this, [vm, sidebarArr]);
    return sidebarArr;
  }
  return;
}

function checkAgent(vm, sidebarArr) {
  if (this.UtilsSvc.notNullOrEmptyObj(vm.appData)) {
    const sidebarArrCopy = angular.copy(sidebarArr);
    if (vm.appData.agentLastName && vm.appData.agentLastName !== '' && !vm.appData.directSaleIndicator) { //use this property as the proxy for existence of agent info from SER
      const agentObj = angular.fromJson({
        "title": "Agent",
        "content": {
          "Name": vm.appData.agentFirstName + ' ' + vm.appData.agentLastName,
          "Agency": vm.appData.agencyName,
          "Tax ID": vm.appData.agentTaxId
        }
      });
      sidebarArrCopy.splice(1, 0, agentObj);
      return sidebarArrCopy;
    } else {
      return sidebarArrCopy.filter((section) => !(/agent/i).test(section.title));
    }
  }
  return sidebarArr;
}

function checkSelectedPlans(vm, sidebarArr) {
  if (this.UtilsSvc.notNullOrEmptyObj(vm.appData)) {
    let sidebarArrCopy = angular.copy(sidebarArr);
    const medPlans = vm.appData.groupPlan.categories.medical.plans;
    const denPlans = vm.appData.groupPlan.categories.dental.plans;
    const medRiders = vm.appData.groupPlan.categories.medical.riders;
    const denRiders = vm.appData.groupPlan.categories.dental.riders;
    let plansArr = [].concat(
      medPlans.filter((plan) => plan.selected), 
      denPlans.filter((plan) => plan.selected),
      medRiders.filter((plan) => plan.selected), 
      denRiders.filter((plan) => plan.selected)
    );
    plansArr = plansArr.map((plan) => plan && plan.planName);
    const planString = plansArr.length > 0 ? plansArr.join(', ') : false;
    if (planString) { //TODO - condition properly
      sidebarArrCopy.push({
        "title": "Selected plans",
        "content": {
          "Plans and riders": planString
        }
      });
    } else {
      sidebarArrCopy = sidebarArrCopy.filter((sidebarObj) => !(/plans/i).test(sidebarObj.title));
    }
    return sidebarArrCopy;
  }
  return sidebarArr;
}

export default angular
  .module('sgAppRoot')
  .service('SidebarSvc', SidebarSvc);
