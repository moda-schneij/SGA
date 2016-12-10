/* jshint node: true */
'use strict';

/**
 * @ngdoc overview
 * @name navMainComponent
 * @description
 * Main nav component of the Small Group Application app.
 */

import angular from 'angular';
import sidebarTemplate from './sidebar.html';
import sgAppRoot from '../../root/sgApp.component.root';

export default angular
  .module('sgAppRoot')
  .component('sidebar', {
    templateUrl: sidebarTemplate,
    bindings: {
      isLoggedIn: '<',
      appData: '<',
      sidebarObj: '<',
      groupOR: '<',
      groupAK: '<'
    },
    require: {
      rootCtrl: '^sgaRoot'
    },
    controller: SidebarCtrl,
    controllerAs: 'sidebar'
  });

/*@ngInject*/
function SidebarCtrl($log, $scope, SidebarSvc, UtilsSvc) {
//I am offloading stuff onto a coupled service (SidebarSvc), and directly passing in the vm to each method
//Not sure this is worth it, because it's entirely not reusable, but easier to read here
  const vm = this;
  let deregisterAppdataWatch;
  let deregisterSidebarObjWatch;

  vm.sections = [];

  vm.$onInit = function() {
    $log.debug('this is the application object inside the sidebar: ');
    $log.debug(vm.appData);
    //the rootCtrl (parent controller) is only available during $onInit, not before
    vm.setDisplaySidebar = function(bool) { //tells the parent controller to switch display of the sidebar
      vm.rootCtrl.setDisplaySidebar(bool);
    };
    //initilaize the sidebar with no data, just empty sections
    SidebarSvc.initSidebar(vm);
    if (UtilsSvc.notNullOrEmptyObj(vm.appData)) {
      SidebarSvc.populateSidebar(vm);
    }
    //watch the application data state that's passed down from the parent (root component) as a prop
    deregisterAppdataWatch = $scope.$watch(
      () => vm.appData,
      (newVal, oldVal) => {
        if (UtilsSvc.notNullOrEmptyObj(newVal)) {
          if (newVal !== oldVal) {
            SidebarSvc.updateSidebar(vm);
          }
        } else { //there is nothing here (evaluates to false)
          SidebarSvc.initSidebar(vm); //emtpy and hide the sidebar
          //try the plain initSidebar method (no evalAsync)
          //the evalAsync method is depopulateSidebar - they do the same thing, otherwise
        }
      }, true //deep watch
    );
    deregisterSidebarObjWatch = $scope.$watchCollection(
      () => [vm.sidebarObj],
      (sidebarObj) => {
        const isObj = angular.isObject(sidebarObj) && !angular.isArray(sidebarObj);
        const isArray = angular.isArray(sidebarObj);
        const isEmpty = isObj ? 
          Object.keys(sidebarObj).length === 0 : 
          isArray ? //if an array, check length and that it isn't an array containing only undefined
          (sidebarObj.length === 0 || !sidebarObj[0]) : 
          true;
        if (UtilsSvc.notNullOrEmptyObj(vm.appData)) { //only proceed if there's appdata to work with
          if ((isObj || isArray) && !isEmpty) {
            SidebarSvc.addToSidebar(vm, sidebarObj);
          } else {
            SidebarSvc.resetSidebar(vm);
          }
        }
      }
    );
  };

  vm.$onDestroy = function() {
    deregisterAppdataWatch();
    deregisterSidebarObjWatch();
  };
}