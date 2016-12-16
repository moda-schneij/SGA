'use strict';

/**
 * @ngdoc overview
 * @name loginComponent
 * @description
 * Login component of the Small Group Application app.
 */

import loginTemplate from './login.html';

export const loginComponent = {
  templateUrl: loginTemplate,
  controller: LoginCtrl
};

/*@ngInject*/
function LoginCtrl($transitions, ConstantsSvc, XdMessagingSvc, AuthenticationSvc, ApplicationSvc, $log, $sce, $window) {
  var vm = this;

  vm.serContext = ConstantsSvc.SER_CONTEXT;

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

