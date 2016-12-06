'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:applicationComponent
 * @description
 * # ApplicationComponent
 * Service of the Small Group Application app
 */
 
import angular from 'angular';

class RootComponentSvc {

  /*@ngInject*/
  constructor($log, $state, $q, $sce, StorageSvc, UtilsSvc, UserSvc, ContentSvc, STORAGE_KEYS) {
    this.$log = $log;
    this.$state = $state;
    this.$q = $q;
    this.$sce = $sce;
    this.StorageSvc = StorageSvc;
    this.UtilsSvc = UtilsSvc;
    this.UserSvc = UserSvc;
    this.ContentSvc = ContentSvc;
    this.STORAGE_KEYS = STORAGE_KEYS;
    this.setComputedProps = this.setComputedProps.bind(this);
    this.setRouteValues = this.setRouteValues.bind(this);
    this.setRouteValuesAndReady = this.setRouteValuesAndReady.bind(this);
    this.setPageValues = this.setPageValues.bind(this);
  }

  init(vm) {
    this.vm = vm;
  }

  /*************************************
  ** Create controller computed props **
  *************************************/

  setComputedProps(vm) {
    //set computed properties for app status
    Object.defineProperty(vm, 'inProgress', {
      get: () => (vm.appdata && vm.appdata.appStatus ? 
        (/p/i).test(vm.appdata.appStatus) : false),
      enumerable: true,
      configurable: true
    });
  }

  //set default values for routes, like a page title, etc
  setRouteValues(vm) {
    const {$state, $log, $q, UserSvc} = this;
    vm.pageTitle = $state.current && $state.current.data && angular.isString($state.current.data.title) ? 
      $state.current.data.title : 'Welcome';
    vm.overrideDefaultTitle = $state.current && $state.current.data && $state.current.data.overrideDefaultTitle === true;
    $log.debug('current state', $state.current);
    $log.debug('$state', $state);
    vm.pagePath = angular.isString($state.router.urlRouter.location) ? $state.router.urlRouter.location.toLowerCase() : '';
    vm.showPageTitle = vm.pageTitle && vm.pageTitle !== '';
    vm.pageTitle = vm.pageTitle && vm.pageTitle !== '' ? vm.pageTitle : 'Welcome';
    vm.isLoggedIn = UserSvc.getIsLoggedIn();
  }

  setRouteValuesAndReady(vm) {
    this.setRouteValues(vm);
    vm.setRouteReady();
  }

  setPageValues(vm) {
    const {$q, StorageSvc, UtilsSvc, ContentSvc, STORAGE_KEYS} = this;
    const deferred = $q.defer();
    if (!StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY)) {
      StorageSvc.setSessionStore(STORAGE_KEYS.CONTENT_KEY, {});
    }
    const storedAppData = StorageSvc.getSessionStore(STORAGE_KEYS.APPLICATION_KEY);
    const storedFooterContent = StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer;
    const promises = {};
    this.setRouteValues(vm);
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
      .then((responses) => {
        if (UtilsSvc.notNullOrEmptyObj(responses.appdata)) {
          setAppData.apply(this, [responses.appdata, vm]);
        } else {
          handleAppDataError.call(this, 'No application returned from server.');
          deferred.resolve(false);
        }
        if (responses.footerContent) {
          footerContentSuccess.apply(this, [responses.footerContent, vm]);
        }
        deferred.resolve(true);
      }, (reasons) => {
        $log.error(reasons);
        if (reasons.appdata) {
          handleAppDataError.call(this, reasons.appdata);
        }
        if (reasons.footerContent) {
          footerContentError.call(this, reasons.footerContent);
        }
        deferred.resolve(true); //TODO - evaluate how this entire chain of logic is handling errors - test!
        //this still blocks the UI if one fails, so try different handlers - inspect q.all documentation
      });
    return deferred.promise;
  }

  routeConfigFn() {
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

    if (__SER_CONTEXT__) {
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

}

function setAppData(response, vm) {
  const {$log, UtilsSvc} = this;
  $log.debug('setting appData in root component: ');
  $log.debug(response);
  if (UtilsSvc.notNullOrEmptyObj(response)) {
    vm.appdata = response;
    //also to pass as props to the application, for forking behavior, etc
    vm.groupOR = response.group.clientState === 'OR';
    vm.groupAK = response.group.clientState === 'AK';
    this.setComputedProps(vm);
  } else {
    $log.error('no app data in root component');
  }
  return true;
}

function handleAppDataError(error) {
  const {$log} = this;
  $log.error('error getting appData in root component on login: ');
  $log.error(error);
  return true;
}

function footerContentSuccess(response, vm) {
  const {$log, $sce} = this;
  const footerContent = $sce.trustAsHtml(response);
  $log.debug(footerContent);
  vm.footerContent = footerContent;
  return true;
}

function footerContentError(error) {
  const {$log} = this;
  $log.error(error);
  return true;
}

export default angular
  .module('sgAppRoot')
  .service('RootComponentSvc', RootComponentSvc);