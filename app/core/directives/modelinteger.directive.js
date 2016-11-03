'use strict';

/**
 * @ngdoc overview
 * @name modelIntegerDirective
 * @description
 * Model integer directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('modelIntegerDirective', [])
  .directive('modelInteger', modelIntegerDirectiveFn);

/*@ngInject*/
function modelIntegerDirectiveFn($log, UtilsSvc) {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      maxValue: '@',
      minValue: '@'
    },
    link: function ($scope, $element, $attrs, ngModelCtrl) {

      //validators
      ngModelCtrl.$validators.exceedsMax = (modelVal, viewVal) => {
        if ($attrs.maxValue && !ngModelCtrl.$isEmpty(modelVal)) {
          //negate the condition you want to test (return false means invalid)
          return !(parseInt(modelVal, 10) > parseInt($attrs.maxValue, 10));
        }
        return true;
      };

      ngModelCtrl.$validators.belowMin = (modelVal, viewVal) => {
        if ($attrs.minValue && !ngModelCtrl.$isEmpty(modelVal)) {
          //negate the condition you want to test (return false means invalid)
          return !(parseInt($attrs.minValue, 10) > parseInt(modelVal, 10));
        }
        return true;
      };

      ngModelCtrl.$validators.notNumber = (modelVal, viewVal) => {
        if (!ngModelCtrl.$isEmpty(modelVal) && !UtilsSvc.isNumberOrNumString(modelVal)) {
          return false;
        }
        return true;
      };

    }
  };
}