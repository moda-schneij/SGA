/* jshint node: true */

'use strict';

/**
 * @ngdoc overview
 * @name rootComponent
 * @description
 * Root component of the Small Group Application app.
 */

import angular from 'angular';
import rootTemplate from './root.html';

/*eslint-disable*/
const MODA = window.MODA || {};
/*eslint-enable*/
MODA.SGA = MODA.SGA || {};
const serContext = MODA.SGA.appRoot ? MODA.SGA.appRoot.toLowerCase().indexOf('speederates') > -1 : false;
let quoteId;
let appId;
let ein;

export default angular
  .module('sgAppRoot', [])
  .component('sgaRoot', {
    templateUrl: rootTemplate,
    transclude: true,
    controller: sgAppCtrl
    //this would be unnecessary with ui-router, but see the routeConfigFn for revising sgApp.states.root.js
    //,
    //$routeConfig: routeConfigFn.call(sgAppCtrl)
  });

/*@ngInject*/
function sgAppCtrl(RootComponentSvc, $transitions, $state, $log, $q, $scope, $rootScope, $timeout, $location, UtilsSvc, 
    SpinnerControlSvc, AuthenticationSvc, ApplicationSvc, UserSvc, UrlSvc, ConstantsSvc, 
    APP_ROOT, STORAGE_KEYS, StorageSvc, DataSvc, ContentSvc, $sce) {
  const vm = this;
  vm.quoteId = quoteId = UrlSvc.getQuoteIdFromUrl() || null;
  vm.ein = ein = UrlSvc.getEINFromUrl() || null;
  vm.appId = appId = UrlSvc.getAppIdFromUrl() || null;
  vm.serFrameUrl = $sce.trustAsResourceUrl(ConstantsSvc.SER_ROOT_URL + '/?iframe=true');
  vm.footerContent = '';
  vm.appRoot = APP_ROOT;
  vm.isLoggedIn = UserSvc.getIsLoggedIn();
  vm.displaySidebar = false;
  vm.pageReady = false; //TODO - reevaluate all of the logic that toggles the display of content
  vm.routeReady = false;
  vm.appdata = {}; //set after application data is retrieved
  
  vm.setRouteReady = () => {
    vm.routeReady = true;
    vm.pageReady = true;
    SpinnerControlSvc.stopSpin();
  };

  vm.setDisplaySidebar = function(bool) {
    vm.displaySidebar = bool;
  };

  vm.addToSidebar = (sidebarObj) => {
    vm.addToSidebarObj = sidebarObj;
  };

  vm.resetSidebar = () => {
    vm.addToSidebarObj = null;
  };

  vm.$onInit = function() {
    //test injecting vm
    RootComponentSvc.init(vm);
    if (!vm.isLoggedIn && ConstantsSvc.SER_CONTEXT) {
      AuthenticationSvc.getIsLoggedIn().then(function() {
        initView(); //the query parameter (quote id or app id) is lost by the time this is called - we have routed
      });
    } else {
      initView();
    }
    //if the current state says to not block the route, go ahead and resolve it, the hacky way that's in this root controller
    if ($state.current && $state.current.data && $state.current.data.doNotBlock === true) {
      RootComponentSvc.setRouteValuesAndReady(vm);   
    }    
  };

  //I will be calling this from the nested application component controller, which has a binding to this controller
  vm.persistAppData = function() {
    setAppData(vm.appdata);
  };

  //ui-router - any successful transition should set route values
  $transitions.onSuccess({}, () => { 
    RootComponentSvc.setRouteValues(vm);
  });
  $transitions.onRetain({}, () => { 
    RootComponentSvc.setRouteValues(vm);
  });

  function initView() {
    vm.isLoggedIn = UserSvc.getIsLoggedIn();
    if (vm.isLoggedIn) {
      RootComponentSvc.setPageValues(vm).then(() => {
        if (vm.rootform) {
          vm.rootform.$setPristine();
          vm.rootform.$setUntouched();
        }
        vm.pageReady = true;
      }); //TODO - add a handler for promise returned false because of problems getting data
    } else { 
      if (!ConstantsSvc.SER_CONTEXT) { //not logged in, default to the login route, dev environment
        vm.pageReady = true;
      } else { //not logged in coming from SER, so logout
        $log.error('not logged in coming from SER');
        //TODO - dialog and logout?
      }
    }
  }

  //login and logout
  const deregisterLoginSuccess = $rootScope.$on('loginSuccess', function(e) {
    e.stopPropagation();
    //disable the next route until it signals it's ready
    vm.routeReady = false;
    $rootScope.$evalAsync(function() {
      if (!ConstantsSvc.SER_CONTEXT) { //only initialize on login for standalone (dev) version
        //coming from SER, the appdata call itself triggers the initialization of the view
        initView();
      }
      vm.isLoggedIn = UserSvc.getIsLoggedIn();
      if (ConstantsSvc.SER_CONTEXT) { //only deregister this listener if coming from SER, because otherwise the root component onInit isn't called on subsequent logins
        deregisterLoginSuccess();
      }
    });
  });
  const deregisterLogout = $rootScope.$on('logout', function(e) {
    e.stopPropagation();
    $scope.$evalAsync(function() {
      vm.isLoggedIn = UserSvc.getIsLoggedIn();
      vm.appdata = null;
    });
  });
  //this is needed to deal with a circular service dependency, and I don't have time to come up with another solution
  const deregisterCallLogout = $rootScope.$on('callLogout', AuthenticationSvc.logout.bind(AuthenticationSvc, {
    dirty: vm.rootform && vm.rootform.$dirty,
    invalid: vm.rootform && vm.rootform.$invalid
  }));
  
  //EVENTS EMITTED FROM HEADER COMPONENT
  vm.logout = ($event) => {
    //TODO - pass form invalid/pristine data
    AuthenticationSvc.logout({
      dirty: vm.rootform.$dirty,
      invalid: vm.rootform.$invalid
    });
  };

  vm.deleteApp = ($event) => {
    ApplicationSvc.delete(vm.appdata);
  };

  vm.viewApp = ($event) => {
    DataSvc.application.download($event.appid); //the DataSvc method here handles the entire process
    //no promise is returned;
  };

  vm.setManualProcess = ($event) => {
    const options = {};
    if ($event.allowCancel) {
      options.cancelButton = 'Continue application';
      options.cancel = true;
    }
    ApplicationSvc.setManualProcess(vm, options);
  };

  vm.returnToSER = ($event) => {
    ApplicationSvc.checkin({
      dirty: vm.rootform.$dirty,
      invalid: vm.rootform.$invalid,
      prompt: true
    });
  };

  vm.$onDestroy = function() {
    deregisterLoginSuccess();
    deregisterLogout();
    deregisterCallLogout();
  };

  //TODO - determine whether this was being used at all
  //vm.routeConfig = RootComponentSvc.routeConfigFn(vm); //this is being passed to menu components

}