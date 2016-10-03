'use strict';

/**
 * @ngdoc overview
 * @name modelFloatDirective
 * @description
 * Model float directive of the Small Group Application app.
 */

import angular from 'angular';
import sgAppCore from '../sgApp.core';

export default angular.module('modelFloatDirective', [])
  .directive('modelFloat', modelFloatDirectiveFn);

/*@ngInject*/
function modelFloatDirectiveFn($log, $filter, UtilsSvc) {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      maxValue: '@',
      minValue: '@'
    },
    link: function ($scope, $element, $attrs, ngModelCtrl) {

      $element.on('blur', blurHandler);

      //parser and formatter
      ngModelCtrl.$formatters.push(floatFormatter);
      ngModelCtrl.$parsers.push(floatParser);

      function floatFormatter(value) {
        return $filter('number')(value, 2);
      }

      function floatParser(value) {
        return parseFloat(value).toFixed(2);
      }

      function blurHandler() {
        const formattedModel = floatFormatter(ngModelCtrl.$viewValue);
        ngModelCtrl.$setViewValue(formattedModel);
        ngModelCtrl.$render();
      }

      //validators
      ngModelCtrl.$validators.exceedsMax = (modelVal, viewVal) => {
        if ($attrs.maxValue && !ngModelCtrl.$isEmpty(modelVal)) {
          //negate the condition you want to test (return false means invalid)
          return !(parseFloat(modelVal).toFixed(2) > parseFloat($attrs.maxValue).toFixed(2));
        }
        return true;
      };

      ngModelCtrl.$validators.belowMin = (modelVal, viewVal) => {
        if ($attrs.minValue && !ngModelCtrl.$isEmpty(modelVal)) {
          //negate the condition you want to test (return false means invalid)
          return !(parseFloat($attrs.minValue).toFixed(2) > parseFloat(modelVal).toFixed(2));
        }
        return true;
      };

      ngModelCtrl.$validators.notNumber = (modelVal, viewVal) => {
        if (!ngModelCtrl.$isEmpty(modelVal) && !UtilsSvc.isNumberOrNumString(modelVal)) {
          return false;
        }
        return true;
      };

      $scope.$on('$destroy', () => {
        $element.off('blur');
      });

    }
  };
}