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

import rootStates from '../root/sgApp.states.root';
import applicationStates from '../views/application/sgApp.states.application';

const sgaConfig = (CONFIGS, $qProvider, $httpProvider, $urlRouterProvider, $stateProvider, $logProvider, $locationProvider, $sceDelegateProvider, usSpinnerConfigProvider, ngDialogProvider, uiSelectConfig, $provide) => {
  'ngInject';
  //$qProvider.errorOnUnhandledRejections(false);
  $httpProvider.interceptors.push('AuthInterceptorSvc');
  $logProvider.debugEnabled(!PROD); //disable debug logging in production
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/oops');
  //!__SER_CONTEXT__ && $urlRouterProvider.deferIntercept();
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our parent context application.  Notice the difference between * and **.
    MODA.baseDomain + '**'
  ]);
  usSpinnerConfigProvider.setDefaults(CONFIGS.spinner);
  ngDialogProvider.setDefaults(CONFIGS.dialogDefaults);
  uiSelectConfig.theme = 'select2';
  uiSelectConfig.resetSearchInput = true;
  //decorate the number picker directive
  Object.keys(decorators).forEach((name) => $provide.decorator(name, decorators[name]));
};

export default sgaConfig;
