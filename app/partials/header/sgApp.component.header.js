/* jshint node: true */
'use strict';

/**
 * @ngdoc overview
 * @name headerComponent
 * @description
 * Header component of the Small Group Application app.
 */

import angular from 'angular';
import headerTemplate from './header.html';
import sgAppRoot from '../../root/sgApp.component.root';

export default angular
  .module('sgAppRoot')
  .component('sgaHeader', {
    templateUrl: headerTemplate,
    bindings: {
      $router: '<',
      isloggedin: '<',
      inprogress: '<',
      pagetitle: '<',
      showtitle: '<',
      routeconfig: '<',
      groupor: '<',
      groupak: '<',
      appid: '<',
      user: '<',
      appStatus: '<',
      onLogout: '&',
      onDeleteApp: '&',
      onReturnSer: '&',
      onSetManual: '&',
      onViewApp: '&'
    },
    controller: HeaderCtrl,
    controllerAs: 'header'
  });

/*@ngInject*/
function HeaderCtrl(SER_CONTEXT, $log, ApplicationSvc, DataSvc, $sce) {
  var vm = this;

  vm.appAction = ''; //dummy for navbar action dropdown

  vm.appName = {
    title: 'Small group application',
    action: function() {
      // TODO - program an action for the appname link
    }
  };
  //build the navutil navigation using the router config passed from the root component
  //TODO - replace with manual list that has appropriate header links
  vm.navUtil = (function() {
    const _navUtil = [];
    angular.forEach(vm.routeconfig, function(route, key) {
      if (route.data.addToMenu) {
        const navObj = {
          name: route.name,
          ngLink: vm.isloggedin ? '["' + route.name + '"]' : '',
          title: route.data.linkTitle
        };
        _navUtil.push(navObj);
      }
    });
    return _navUtil;
  }());
  vm.menuLoggedIn = (function() {
    const _menuLoggedIn = [];
    // const logoutItem = {
    //   path: '',
    //   title: 'Log out'
    // };
    //_menuLoggedIn.push(logoutItem);
    return _menuLoggedIn;
  }());
  $log.debug('vm.routeconfig: ');
  $log.debug(vm.routeconfig);
  vm.homeName = (function() {
    angular.forEach(vm.routeconfig, function(route, key) {
      if (route.path === '/') {
        return route.name;
      }
    });
  }());


  //Events passed in the calls to logout, and return to SER aren't really being used. Even for delete, although I might try passing data
  //these are really proxies for the root component to call the application service
  //important particularly for intercepting the action and throwing a dialog
  //with logout, and maybe others, the root component actually checks the state of the nested application form
  //there is a prompt for losing unsaved changes, in that case
  vm.logout = () => {
    vm.onLogout({
      $event: {
        action: 'logout'
      }
    });
  };

  vm.returnToSER = () => {
    vm.onReturnSer({
      $event: {
        action: 'exit'
      }
    });
  };

  vm.deleteApp = () => {
    vm.onDeleteApp({
      $event: {
        action: 'delete',
        appid: vm.appid
      }
    });
  };

  vm.viewApp = () => {
    vm.onViewApp({
      $event: {
        action: 'view',
        appid: vm.appid
      }
    });
  };

  vm.setManual = () => {
    vm.onSetManual({
      $event: {
        action: 'setManual',
        appid: vm.appid,
        allowCancel: true
      }
    });
  };

  vm.menuAction = ($item, $model) => {
    angular.noop();
  };

  vm.actionItems = [
    {
      displayName: 'View application',
      value: '<span class="nav-item-select-link" ng-click="header.viewApp()">View application PDF</span>'
    },
    {
      displayName: 'Set manual process',
      value: '<span class="nav-item-select-link" ng-click="header.setManual()">Set manual process</span>'
    },
    {
      displayName: 'Delete application',
      value: '<span class="nav-item-select-link" ng-click="header.deleteApp()">Delete application</span>'
    }
  ];

  Object.defineProperty(vm, 'deletableApp', {
    get: () => (/[C,P,F]{1}/).test(vm.appStatus),
    enumerable: true,
    configurable: true
  });
  
  vm.serContext = SER_CONTEXT;
}

