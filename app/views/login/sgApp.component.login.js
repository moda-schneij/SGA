'use strict';

/**
 * @ngdoc overview
 * @name loginComponent
 * @description
 * Login component of the Small Group Application app.
 */

import angular from 'angular';
import loginTemplate from './login.html';

export default angular
  .module('sgAppLogin', [])
  .component('loginComponent', {
    templateUrl: loginTemplate,
    require: {
      rootCtrl: '^sgaRoot'
    },
    controller: LoginCtrl
  });

/*@ngInject*/
function LoginCtrl(ConstantsSvc, XdMessagingSvc, AuthenticationSvc, ApplicationSvc, $log, $rootRouter, $location, $sce, $window) {
  var vm = this;

  vm.serContext = ConstantsSvc.SER_CONTEXT;
  
  vm.$onInit = () => {
    vm.rootCtrl.setRouteReady();
  };

  if (!vm.serContext) {
    $window.addEventListener('message', XdMessagingSvc.handleXdTokenResponse, false);

    vm.serUrl = $sce.trustAsResourceUrl(ConstantsSvc.SER_URL);
    
    vm.fooBar = ConstantsSvc.RANDOM_VAL;

    vm.user = {
      username: '',
      password: ''
    };

    vm.appid = null;

    vm.login = function (e) {
      AuthenticationSvc.login(vm.user, e);
      if (vm.appid) {
        ApplicationSvc.setAppID(vm.appid);
      } else {
        ApplicationSvc.clearAppID();
      }
    };
  }

}

