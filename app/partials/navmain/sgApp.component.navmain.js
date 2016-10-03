/* jshint node: true */
'use strict';

/**
 * @ngdoc overview
 * @name navMainComponent
 * @description
 * Main nav component of the Small Group Application app.
 */

import angular from 'angular';
import navMainTemplate from './navmain.html';
import sgAppRoot from '../../root/sgApp.component.root';

export default angular
  .module('sgAppRoot')
  .component('sgaNavmain', {
    templateUrl: navMainTemplate,
    bindings: {
      $router: '<',
      isloggedin: '<',
      routeconfig: '<'
    },
    controller: NavMainCtrl,
    controllerAs: 'navmain'
  });

/*@ngInject*/
function NavMainCtrl(ConstantsSvc, $log, $rootScope, $rootRouter, $location) {
  var vm = this;
  vm.menuNavMain = (function() { //build the navutil navigation using the router config passed from the root component
    const _navUtil = [];
    angular.forEach(vm.routeconfig, function(route) {
      if (route.data.addToMenu) {
        var navObj = {
          name: route.name,
          ngLink: vm.isloggedin ? '["' + route.name + '"]' : '',
          title: route.data.linkTitle,
          pathName: route.path.replace(/\//, '') + '-page',
          current: false
        };
        _navUtil.push(navObj);
      }
    });
    return _navUtil;
  }());
  $log.debug('vm.routeconfig: ');
  $log.debug(vm.routeconfig);
  vm.serContext = ConstantsSvc.SER_CONTEXT;
}

