'use strict';

/**
 * @ngdoc overview
 * @name modelCurrencyDirective
 * @description
 * Model currency directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('modelCurrencyDirective', [])
  .directive('modelCurrency', modelCurrencyDirectiveFn);

/*@ngInject*/
function modelCurrencyDirectiveFn($parse, $filter, $log) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function ($scope, $element, $attrs, ngModelCtrl) {

      const currencyRegex = /^\$?\d*(\.\d{1,2})?$/;
      //if there is no boolean, default to true
      const currencyBool = $parse($attrs.modelCurrency)($scope);
      const applyCurrency = angular.isDefined(currencyBool) ? 
        currencyBool : 
        true;

      if (applyCurrency) {
        ngModelCtrl.$formatters.push(dollarFormatter);
        ngModelCtrl.$parsers.push(dollarParser);
        $element.on('blur', blurHandler);
        ngModelCtrl.$viewChangeListeners.push(listernCb);
      }

      function blurHandler() {
        const formattedModel = dollarFormatter(ngModelCtrl.$viewValue);
        ngModelCtrl.$setViewValue(formattedModel);
        ngModelCtrl.$render();
      }

      function dollarFormatter(value) {
        //remove anything but a digit or decimal
        const stringVal = value || value === 0 ? value.toString().replace(/[^\d\.]/g, '') : '';
        //match against a basic currency regex
        const returnVal = stringVal.match(currencyRegex) ? stringVal.match(currencyRegex)[0] : '';
        if (!value || !currencyRegex.test(stringVal) || returnVal.length === 0) {
          return '';
        }
        $log.debug('dollarFormatter returnVal: ' + $filter('currency')(returnVal));
        return $filter('currency')(returnVal);
      }

      function dollarParser(value) {
        const stringVal = value || value === 0 ? value.toString().replace(/[^\d\.]/g, '') : '';
        const returnVal = stringVal.match(currencyRegex) ? stringVal.match(currencyRegex)[0] : '';
        if (!value || stringVal === '' || returnVal.length === 0) {
          return;
        }
        $log.debug('dollarParser returnVal: ' + returnVal);
        return returnVal;
      }

      function listernCb() {
        $log.debug('viewValue: ' + ngModelCtrl.$viewValue);
      }

      $scope.$on('$destroy', () => {
        $element.off('blur');
      });

    }
  };
}