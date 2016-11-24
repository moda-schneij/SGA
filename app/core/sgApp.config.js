'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * Config module of the Small Group Application app.
 */

const PROD = __PROD__ || false;
const SER_CONTEXT = __SER_CONTEXT__ || false;
const otherwiseRoute = SER_CONTEXT ? '/' : '/login'; //not sure about this yet
/*eslint-disable*/
const MODA = window.MODA || {};
/*eslint-enable*/
MODA.SGA = MODA.SGA || {};
import decorators from './sgApp.decorators';

/*@ngInject*/
const sgaConfig = (CONFIGS, $httpProvider, $logProvider, $locationProvider, $urlRouterProvider, $stateProvider, 
    $sceDelegateProvider, usSpinnerConfigProvider, ngDialogProvider, uiSelectConfig, $provide) => {
  $httpProvider.interceptors.push('AuthInterceptorSvc');
  $logProvider.debugEnabled(!PROD); //disable debug logging in production
  $locationProvider.html5Mode(false);
  $urlRouterProvider.otherwise('/');
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our parent context application.  Notice the difference between * and **.
    MODA.baseDomain + '**'
  ]);
  usSpinnerConfigProvider.setDefaults(CONFIGS.spinner);
  ngDialogProvider.setDefaults(CONFIGS.dialogDefaults);
  uiSelectConfig = angular.extend(uiSelectConfig, {
    theme: 'select2',
    resetSearchInput: true
  });
  //decorate the number picker directive
  Object.keys(decorators).forEach((name) => $provide.decorator(name, decorators[name]));
};

export default sgaConfig;