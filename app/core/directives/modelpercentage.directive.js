'use strict';

/**
 * @ngdoc overview
 * @name modelPercentageDirective
 * @description
 * Model percentage directive of the Small Group Application app.
 */

import angular from 'angular';
import sgAppCore from '../sgApp.core';

export default angular.module('modelPercentageDirective', [])
  .directive('modelPercentage', modelPercentageDirectiveFn);

/*@ngInject*/
function modelPercentageDirectiveFn($parse, $filter, $log, UtilsSvc) {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      maxValue: '@',
      minValue: '@'
    },
    link: function ($scope, $element, $attrs, ngModelCtrl) {

      //if there is no boolean, default to true
      const percentageBool = $parse($attrs.modelPercentage)($scope);
      const applyPercentage = angular.isDefined(percentageBool) ? 
        percentageBool : 
        true;

      if (applyPercentage) {
        ngModelCtrl.$formatters.push(pctFormatter);
        ngModelCtrl.$parsers.push(pctParser);
        $element.on('blur', blurHandler);
        ngModelCtrl.$viewChangeListeners.push(listernCb);
      }

      function blurHandler() {
        const formattedVal = pctFormatter(ngModelCtrl.$viewValue);
        ngModelCtrl.$setViewValue(formattedVal);
        ngModelCtrl.$render();
      }

      
      function pctFormatter(value) {
        const stringVal = value || value === 0 ? value.toString().replace('%', '') : '';
        if (stringVal === '') {
          return '';
        }
        return stringVal + '%';
      }
      
      function pctParser(value) {
        const stringVal = value || value === 0 ? value.toString().replace('%', '') : '';
        if (!value || stringVal === '') {
          return;
        }
        return stringVal;
      }

      function listernCb() {
        $log.debug('viewValue: ' + ngModelCtrl.$viewValue);
      }

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

      $scope.$on('$destroy', () => {
        $element.off('blur');
      });

    }
  };
}