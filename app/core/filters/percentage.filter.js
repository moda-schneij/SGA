'use strict';

/**
 * @ngdoc overview
 * @name modelPercentageDirective
 * @description
 * Percentage filter of the Small Group Application app.
 */

import angular from 'angular';
import sgAppCore from '../sgApp.core';

export default angular.module('percentageFilter', [])
  .filter('percentage', percentageFilterFn);

/*@ngInject*/
function percentageFilterFn($filter, UtilsSvc) {
  return (input, decimals) => {
    const _decimals = (UtilsSvc.isNumber(decimals) || UtilsSvc.isNumString(decimals)) ? decimals : 2;
    return (UtilsSvc.isNumber(input) || UtilsSvc.isNumString(input)) ?
      $filter('number')(input, _decimals) + '%' : 
      input;
  };
}