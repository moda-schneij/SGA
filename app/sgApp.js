'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * Main module of the application.
 */

import 'babel-polyfill';
import jquery from 'jquery';
import angular from 'angular';
import sgAppApplicationForm from './views/application/sgApp.component.application';
import sgAppCore from './core/sgApp.core';
import sgAppLogin from './views/login/sgApp.component.login';
import sgAppRoot from './root/sgApp.component.root';

//Imports of components (partials) defined on the root module, in separate files, which are not core application dependencies
/*I don't like this pattern, but so far I can't figure out another way to structure
so that I can get the parent component using a require in the partial component*/

/*eslint-disable no-unused-vars*/

import sidebar from './partials/sidebar/sgApp.component.sidebar';
import header from './partials/header/sgApp.component.header';
import navmain from './partials/navmain/sgApp.component.navmain';
import footer from './partials/footer/sgApp.component.footer';
import messages from './partials/messages/sgApp.component.messages';

//Imports of services for above components
import SidebarSvc from './partials/sidebar/sgApp.service.sidebar';

//Imports of subforms for the application, same reason as above
import groupSizeFormComponent from './views/application/groupsize/sgApp.component.groupsize';
import planSelectFormComponent from './views/application/planselect/sgApp.component.planselect';
import groupInfoFormComponent from './views/application/groupinfo/sgApp.component.groupinfo';
import cobraFormComponent from './views/application/cobra/sgApp.component.cobra';
import agentSalesFormComponent from './views/application/agent_sales/sgApp.component.agentsales';

//Imports of services and directives for above components
import PlanSelectSvc from './views/application/planselect/sgApp.service.planselect';
import ApplicationComponentSvc from './views/application/sgApp.service.applicationcomponent';
import CobraComponentSvc from './views/application/cobra/sgApp.service.cobracomponent';
import GroupsizeComponentSvc from './views/application/groupsize/sgApp.service.groupsizecomponent';
import GroupinfoComponentSvc from './views/application/groupinfo/sgApp.service.groupinfocomponent';
import medEnrollmentValidator from './views/application/planselect/sgApp.directive.medenrollmentvalidator';

/*eslint-enable no-unused-vars*/

//require('./vendor/styles/sga_vendor.scss');
require('../node_modules/select2/select2.css');
require('./styles/sga.scss');

/*eslint-disable*/
var MODA = window.MODA || {};
/*eslint-enable*/

export default angular
  .module('sgApp', [
    'angular-aba-routing-validation',
    'angular-bind-html-compile',
    'angularSpinner',
    'angular-toArrayFilter',
    'duScroll',
    'ngAnimate',
    'ngComponentRouter',
    'ngCookies',
    'ngFileSaver',
    'ngSanitize',
    'ngDialog',
    'ngInputModified',
    'ngNumberPicker',
    'ngResource',
    'pretty-checkable',
    'ui.mask',
    'ui.select',
    sgAppCore.name,
    sgAppApplicationForm.name,
    sgAppRoot.name,
    sgAppLogin.name
  ])
  .config(configFn)
  .value('$routerRootComponent', 'sgaRoot')
  .run(runBlock);

/*@ngInject*/
function runBlock(RouteChangeSvc, StorageSvc, STORAGE_KEYS, $log, $templateCache) {
  RouteChangeSvc.onStart();
  RouteChangeSvc.onSuccess();
  StorageSvc.setSessionStore(STORAGE_KEYS.CONTENT_KEY, angular.toJson({foo: 'bar'}));
  $log.debug(StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY));
}

/*@ngInject*/
function configFn($httpProvider, $locationProvider, $sceDelegateProvider, usSpinnerConfigProvider, ngDialogProvider, uiSelectConfig, $provide) {
  $httpProvider.interceptors.push('AuthInterceptorSvc');
  $locationProvider.html5Mode(false);
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our parent context application.  Notice the difference between * and **.
    MODA.baseDomain + '**'
  ]);
  usSpinnerConfigProvider.setDefaults({
    lines: 11,
    length: 15,
    width: 8,
    radius: 18,
    rotate: 37,
    trail: 66,
    speed: 0.8
  });
  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default',
    showClose: false,
    closeByEscape: false,
    closeByDocument: false
  });
  uiSelectConfig.theme = 'select2';
  uiSelectConfig.resetSearchInput = true;
  //decorate the number picker directive
  /*@ngInject*/
  $provide.decorator('hNumberDirective', ($delegate, $timeout, $log, $parse) => {
    const directive = $delegate[0];
    directive.scope.ctrl = '='; //this is the vm passed to the numpicker
    const compile = directive.compile;
    directive.compile = function(tElement, tAttrs) {
      const link = compile.apply(this, arguments);
      const spans = tElement.find('.input-group-addon');
      angular.element(spans[0])
        .addClass('input-group-addon-left numpicker-button numpicker-decrement')
        .wrapInner('<span class="numpicker-button-text"></span>');
      angular.element(spans[1])
        .addClass('input-group-addon-right numpicker-button numpicker-increment')
        .wrapInner('<span class="numpicker-button-text"></span>');
      angular.element(tElement)
        .addClass('numpicker')
        .find('.input-group-addon ~ label')
        .addClass('numpicker-number')
        .wrapInner('<input name="" ng-model="ctrl.dummy" class="numpicker-value"></input>');

      return function($scope, $elem, $attrs) {
        link.apply(this, arguments);
        const _val = $scope.value ? $scope.value : 0;
        const vm = $scope.ctrl; //to test later for existence
        const $input = $elem.find('.numpicker-value');
        $input.attr('name', $attrs.name)
          .attr('ng-model', $attrs.value)
          .val(_val);
        $scope.$watch(
          () => $scope.value,
          (newVal, oldVal) => {
            const _newVal = newVal ? newVal : 0;
            $input.val(_newVal);
            if (newVal !== oldVal && angular.isDefined(vm)) {
              angular.forEach(vm, (val, key) => {
                if (angular.isObject(val) && val.hasOwnProperty('$setDirty') && angular.isFunction(val.$setDirty)) {
                  val.$setDirty();
                }
              });
            }
          }
        );
      };
    };
    return $delegate;
  });

  // /*@ngInject*/
  // angular.module('ui.select').run(($templateCache) => {//add no-choice template for select2
  //   $templateCache.put("select2/no-choice.tpl.html","<ul class=\"ui-select-no-choice dropdown-menu\" ng-show=\"$select.items.length == 0\"><li ng-transclude=\"\"></li></ul>");
  // });
}