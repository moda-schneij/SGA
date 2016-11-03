'use strict';

/**
 * @ngdoc overview
 * @name bindInputValDirective
 * @description
 * BindInputVal directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('bindInputValDirective', [])
  .directive('bindInputVal', bindInputValDirectiveFn);

/*@ngInject*/
function bindInputValDirectiveFn($parse, UtilsSvc) {
  return {
    restrict: 'A',
    require: ['?ngModel', '?ngValue'],
    link: function($scope, $element, $attrs) {
      const bindOpt = $parse($attrs.bindInputVal)($scope);
      const parseAsFloat = bindOpt && bindOpt.parse && (/float/i).test(bindOpt.parse);
      const parseAsInt = bindOpt && bindOpt.parse && (/int/i).test(bindOpt.parse);
      $attrs.$observe('value', (val) => {
        const _val = !isNaN(val) && angular.isNumber(val) ? 
          UtilsSvc.stripCommas(val.toString()) : angular.isString(val) && val !== '' ? 
          UtilsSvc.stripCommas(val) : false;
        const valToBind = parseAsFloat ? 
          parseFloat(_val) : 
          parseAsInt ? parseInt(_val, 10) : 
          _val ? _val : 0;
        const $model = $parse($attrs.ngModel);
        $model.assign($scope, valToBind);
      });
    }
  };
}