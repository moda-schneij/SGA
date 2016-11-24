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
import {rootState} from './sgApp.states.root';

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
    controller: sgAppCtrl,
    controllerAs: 'sgApp',
    $routeConfig: routeConfigFn.call(sgAppCtrl)
  });

/*@ngInject*/
function sgAppCtrl($log, $q, $scope, $rootScope, $rootRouter, $timeout, $location, UtilsSvc, 
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
    $log.debug('what\'s in rootState?', rootState);
    if (!vm.isLoggedIn && ConstantsSvc.SER_CONTEXT) {
      AuthenticationSvc.getIsLoggedIn().then(function() {
        initView(); //the query parameter (quote id or app id) is lost by the time this is called - we have routed
      });
    } else {
      initView();
    }
  };

  //I will be calling this from the nested application component controller, which has a binding to this controller
  vm.persistAppData = function() {
    setAppData(vm.appdata);
  };

  // trigger to set a page-specific class on the root container
  /* eslint-disable angular/on-watch */ //this is a global event handler that shouldn't be destroyed (afaik)

  const deregisterRouteChangeListener = $rootScope.$on('$routeChangeSuccess', function() {
    setRouteValues();
  });

  /* eslint-enable angular/on-watch */

  function initView() {
    vm.isLoggedIn = UserSvc.getIsLoggedIn();
    if (vm.isLoggedIn) {
      setPageValues().then(() => {
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
    deregisterRouteChangeListener();
  };

  vm.routeConfig = routeConfigFn(); //this is being passed to menu components

  function setAppData(response) {
    $log.debug('setting appData in root component: ');
    $log.debug(response);
    if (UtilsSvc.notNullOrEmptyObj(response)) {
      vm.appdata = response;
      //also to pass as props to the application, for forking behavior, etc
      vm.groupOR = response.group.clientState === 'OR';
      vm.groupAK = response.group.clientState === 'AK';
      setComputedProps(vm);
    } else {
      $log.error('no app data in root component');
    }
    return true;
  }

  function handleAppDataError(error) {
    $log.error('error getting appData in root component on login: ');
    $log.error(error);
    return true;
  }

  function setRouteValues() {
    vm.pageTitle = ($rootRouter.currentInstruction && 
      $rootRouter.currentInstruction.child && 
      $rootRouter.currentInstruction.child.component && 
      $rootRouter.currentInstruction.child.component.routeData.data.title) || 
      ($rootRouter.currentInstruction && 
      $rootRouter.currentInstruction.component && 
      $rootRouter.currentInstruction.component.routeData.data.title);
    vm.pagePath = ($rootRouter.currentInstruction && 
      $rootRouter.currentInstruction.child && 
      $rootRouter.currentInstruction.child.urlPath.toLowerCase() + '-page') || 
      ($rootRouter.currentInstruction && 
      $rootRouter.currentInstruction.urlPath.toLowerCase() + '-page');
    vm.showPageTitle = vm.pageTitle && vm.pageTitle !== '';
    vm.pageTitle = vm.pageTitle && vm.pageTitle !== '' ? vm.pageTitle : 'Welcome';
    vm.isLoggedIn = UserSvc.getIsLoggedIn();
  }

  function setPageValues() {
    const deferred = $q.defer();
    if (!StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY)) {
      StorageSvc.setSessionStore(STORAGE_KEYS.CONTENT_KEY, {});
    }
    const storedAppData = StorageSvc.getSessionStore(STORAGE_KEYS.APPLICATION_KEY);
    const storedFooterContent = StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer;
    const promises = {};
    setRouteValues();
    //TODO - this should be a resolve all on setAppData and footerContentSuccess
    if (!storedAppData) {
      promises.appdata = ApplicationSvc.getInitialApplication({
        quoteId: quoteId,
        appId: appId,
        ein: ein
      });
    } else {
      vm.appdata = storedAppData;
      promises.appdata = $q.when(storedAppData);
    }
    if (!storedFooterContent) {
      promises.footerContent = ContentSvc.getFooterContent();
    } else {
      vm.footerContent = storedFooterContent;
      promises.footerContent = $q.when(storedFooterContent);
    }
    $q.all(promises)
      .then(function(responses) {
        if (UtilsSvc.notNullOrEmptyObj(responses.appdata)) {
          setAppData(responses.appdata);
        } else {
          handleAppDataError('No application returned from server.');
          deferred.resolve(false);
        }
        if (responses.footerContent) {
          footerContentSuccess(responses.footerContent);
        }
        deferred.resolve(true);
      }, function(reasons) {
        $log.error(reasons);
        if (reasons.appdata) {
          handleAppDataError(reasons.appdata);
        }
        if (reasons.footerContent) {
          footerContentError(reasons.footerContent);
        }
        deferred.resolve(true); //TODO - evaluate how this entire chain of logic is handling errors - test!
        //this still blocks the UI if one fails, so try different handlers - inspect q.all documentation
      });
    return deferred.promise;
  }

  function footerContentSuccess(response) {
    const footerContent = $sce.trustAsHtml(response);
    $log.debug(footerContent);
    vm.footerContent = footerContent;
    return true;
  }

  function footerContentError(error) {
    $log.error(error);
    return true;
  }

}

function setComputedProps(vm) {
  //set computed properties for app status
  Object.defineProperty(vm, 'inProgress', {
    get: () => (vm.appdata && vm.appdata.appStatus ? 
      (/p/i).test(vm.appdata.appStatus) : false),
    enumerable: true,
    configurable: true
  });
}

function routeConfigFn() {
  const config = [];
  const startRouteConfig = {
    path: '/login',
    name: 'LoginView',
    component: 'loginComponent',
    useAsDefault: true,
    data: {
      loginRequired: false,
      title: 'Login',
      linkTitle: 'Home',
      addToMenu: false
    }
  };
  const homeRouteConfig = {
    path: '/application/...',
    name: 'ApplicationView',
    component: 'applicationComponent',
    data: {
      loginRequired: true,
      title: 'Welcome to the small group application form',
      linkTitle: 'Home',
      addToMenu: true
    }
  };

  if (serContext) {
    startRouteConfig.path = '/application/...';
    startRouteConfig.name = 'ApplicationView';
    startRouteConfig.component = 'applicationComponent';
    startRouteConfig.data.loginRequired = true;
    startRouteConfig.data.title = 'Welcome to the small group application form';
    startRouteConfig.data.addToMenu = true;
  } else {
    config.unshift(homeRouteConfig);
  }

  config.unshift(startRouteConfig);

  return config;
}
