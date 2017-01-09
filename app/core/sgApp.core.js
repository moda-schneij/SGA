'use strict';

/**
 * @ngdoc overview
 * @name sgAppCore
 * @description
 * Core module of the application.
 */

//this module basically handles all core dependencies of the application
//the core module is then imported by the main application module

import angular from 'angular';
import sgAppCoreSvcs from './services/sgApp.core.services';
import sgAppCoreDirectives from './directives/sgApp.core.directives';

import percentageFilter from './filters/percentage.filter';
import trustedHTMLFilter from './filters/trustedHTML.filter';
import sgaConstants from './sgApp.constants';

export default angular
  .module('sgAppCore', [
    percentageFilter.name,
    sgAppCoreDirectives.name,
    sgAppCoreSvcs.name,
    trustedHTMLFilter.name
  ])
  .constant(sgaConstants);
