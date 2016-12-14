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

export const sgaRoot = {
  templateUrl: rootTemplate,
  //transclude: true,
  controller: sgAppCtrl,
  bindings: {
    appData: '<',
    rules: '<',
    options: '<',
    statesArray: '<',
    footerContent: '<'
  }
};

/*@ngInject*/
function sgAppCtrl(RootComponentSvc, $transitions, $log, $scope, $rootScope, SpinnerControlSvc, AuthenticationSvc, ApplicationSvc, UserSvc, UrlSvc, ConstantsSvc, StorageSvc, STORAGE_KEYS, APP_ROOT, DataSvc, $sce) {
  const vm = this;
  const existingFooterContent = StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY) && StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer ? StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer : null;
  vm.quoteId = quoteId = UrlSvc.getQuoteIdFromUrl() || null;
  vm.ein = ein = UrlSvc.getEINFromUrl() || null;
  vm.appId = appId = ApplicationSvc.getAppID() ? ApplicationSvc.getAppID() :
    UrlSvc.getAppIdFromUrl() ? UrlSvc.getAppIdFromUrl() : null;
  vm.serFrameUrl = $sce.trustAsResourceUrl(ConstantsSvc.SER_ROOT_URL + '/?iframe=true');
  vm.appRoot = APP_ROOT;
  vm.isLoggedIn = UserSvc.getIsLoggedIn();
  vm.displaySidebar = false;
  vm.footerContent = vm.footerContent || $sce.trustAsHtml(existingFooterContent);

  vm.setRouteReady = () => {
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
    vm.isLoggedIn = UserSvc.getIsLoggedIn();
    //test injecting vm into the service (instead of passing with every other call)
    RootComponentSvc.init(vm);
    if (!ConstantsSvc.SER_CONTEXT) { //only initialize on login for standalone (dev) version
      //coming from SER, the appdata call itself triggers the initialization of the view
      initView();
    } else {
      if (!vm.isLoggedIn) {
        //TODO - this is supposed to take in the next route and determine whether auth is required
        //gets logged in state using the ping svc, not just checking session storage
        AuthenticationSvc.getIsLoggedIn().then(function () {
          initView(); //the query parameter (quote id or app id) is lost by the time this is called - we have routed
        });
      }
    }
  };

  //I will be calling this from the nested application component controller, which has a binding to this controller
  vm.persistAppData = function(appData) {
    RootComponentSvc.setAppData(appData, vm);
  };

  function initView() {
    vm.isLoggedIn = UserSvc.getIsLoggedIn();
    if (vm.isLoggedIn) {
      RootComponentSvc.setPageValues(vm);
      RootComponentSvc.resetRootForm(vm);
    } else {
      if (ConstantsSvc.SER_CONTEXT) { //not logged in, default to the login route, dev environment
        $log.error('not logged in coming from SER');
        //TODO - dialog and logout?
      }
    }
  }

  const deregisterLogout = $rootScope.$on('logout', function(e) {
    e.stopPropagation();
    $scope.$evalAsync(function() {
      vm.isLoggedIn = UserSvc.getIsLoggedIn();
      vm.appData = null;
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
    ApplicationSvc.delete(vm.appData);
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
    deregisterLogout();
    deregisterCallLogout();
  };

  /*
  * TRANSITIONS
  */

  //ui-router - any successful transition should set route values
  $transitions.onSuccess({}, () => {
    RootComponentSvc.setRouteValues(vm);
  });
  $transitions.onRetain({}, () => {
    RootComponentSvc.setRouteValues(vm);
  });

  // $transitions.onSuccess({}, () => {
  //   $log.debug('STATE TRANSITION SUCCESS');
  //   RootComponentSvc.resetRootForm(vm);
  // });
  //
  // $transitions.onRetain({}, () => {
  //   $log.debug('STATE RETAINED');
  //   RootComponentSvc.resetRootForm(vm);
  // });
}
