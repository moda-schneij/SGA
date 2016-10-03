'use strict';

/**
 * @ngdoc overview
 * @name footerComponent
 * @description
 * Footer component of the Small Group Application app.
 */

import angular from 'angular';
import footerTemplate from './footer.html';
import sgAppRoot from '../../root/sgApp.component.root';

export default angular
  .module('sgAppRoot')
  .component('footer', {
    templateUrl: footerTemplate,
    bindings: {
      $router: '<',
      isloggedin: '<',
      routeconfig: '<'
    },
    controller: FooterCtrl,
    controllerAs: 'footer'
  });

/*@ngInject*/
function FooterCtrl(ConstantsSvc, $log, $rootScope, $rootRouter, $location) {
  var vm = this;
  vm.serContext = ConstantsSvc.SER_CONTEXT;

  vm.menuFooter = (function() { //build the navutil navigation using the router config passed from the root component
    const _footerMenu = [];
    //create objects to push into the menu
    _footerMenu.push();
    return _footerMenu;
  }());
}