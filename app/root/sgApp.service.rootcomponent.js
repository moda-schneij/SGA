'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:applicationComponent
 * @description
 * # ApplicationComponent
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class RootComponentSvc {

  /*@ngInject*/
  constructor($log, $state, $q, $sce, StorageSvc, UtilsSvc, UserSvc, ContentSvc, ApplicationSvc, STORAGE_KEYS) {
    this.$log = $log;
    this.$state = $state;
    this.$q = $q;
    this.$sce = $sce;
    this.StorageSvc = StorageSvc;
    this.UtilsSvc = UtilsSvc;
    this.UserSvc = UserSvc;
    this.ContentSvc = ContentSvc;
    this.ApplicationSvc = ApplicationSvc;
    this.STORAGE_KEYS = STORAGE_KEYS;
    this.setComputedProps = this.setComputedProps.bind(this);
    this.setRouteValues = this.setRouteValues.bind(this);
    this.setPageValues = this.setPageValues.bind(this);
    this.resetRootForm = this.resetRootForm.bind(this);
    this.setAppData = this.setAppData.bind(this);
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
      get: () => (vm.appData && vm.appData.appStatus ?
        (/p/i).test(vm.appData.appStatus) : false),
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

  setPageValues(vm) {
    //const {$q, $log, StorageSvc, UtilsSvc, ApplicationSvc, STORAGE_KEYS} = this;
    this.setRouteValues(vm);
    vm.groupOR = vm.appData.group.clientState === 'OR';
    vm.groupAK = vm.appData.group.clientState === 'AK';
    this.setComputedProps(vm);
  }

  resetRootForm(vm) {
    if (vm.rootform) {
      vm.rootform.$setPristine();
      vm.rootform.$setUntouched();
    }
  }

  setAppData(data, vm) {
    const {$log, UtilsSvc} = this;
    $log.debug('setting appData in root component: ');
    $log.debug(data);
    if (UtilsSvc.notNullOrEmptyObj(data)) {
      //also to pass as props to the application, for forking behavior, etc
      vm.groupOR = data.group.clientState === 'OR';
      vm.groupAK = data.group.clientState === 'AK';
      this.setComputedProps(vm);
    } else {
      $log.error('no app data in root component');
    }
    return true;
  }
}
