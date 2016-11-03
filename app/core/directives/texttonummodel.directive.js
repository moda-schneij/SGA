'use strict';

/**
 * @ngdoc overview
 * @name modelPercentageDirective
 * @description
 * Model percentage directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('textToNumModelDirective', [])
  .directive('textToNumModel', textToNumModelDirectiveFn);

/*@ngInject*/
function textToNumModelDirectiveFn($parse, $filter, $log) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function ($scope, $element, $attrs, ngModelCtrl) {

      const opt = $parse($attrs.textToNumModel)($scope);
      const parseAsFloat = opt && opt.float || false;

      ngModelCtrl.$formatters.push(numFormatter);
      ngModelCtrl.$parsers.push(stringParser);
      ngModelCtrl.$viewChangeListeners.push(listernCb);

      function numFormatter(value) {
        return value ? value.toString() : '0';
      }
      
      function stringParser(value) {
        return value ? 
          (parseAsFloat ? parseFloat(value) : parseInt(value, 10)) : 0; //default is to parse as integer.
          //for parseAsFloat, do not fix decimals here, but using filters in the view
      }

      function listernCb() {
        $log.debug('viewValue: ' + ngModelCtrl.$viewValue);
      }

    }
  };
}