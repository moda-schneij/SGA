'use strict';

/**
 * @ngdoc overview
 * @name sgAppThirdParty
 * @description
 * Third-party module of the small group application app.
 */

//this module basically handles all third-party module dependencies of the application
//this module is then imported by the core application module, which in turn is a dependency of the main module

import angular from 'angular';

export default angular
  .module('sgAppThirdParty', [
    'angular-aba-routing-validation',
    'angular-bind-html-compile',
    'angularSpinner',
    'angular-toArrayFilter',
    'duScroll',
    'ngAnimate',
    'ngCookies',
    'ngFileSaver',
    'ngSanitize',
    'ngDialog',
    'ngInputModified',
    'ngNumberPicker',
    'ngResource',
    'pretty-checkable',
    'ui.mask',
    'ui.router',
    'ui.select'
  ]);
