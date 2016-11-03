'use strict';

/**
 * @ngdoc overview
 * @name formOnChangeDirective
 * @description
 * FormOnChange directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('formOnChangeDirective', [])
  .directive('formOnChange', formOnChangeDirectiveFn);

/*@ngInject*/
function formOnChangeDirectiveFn($parse, $log) {
  return {
    require: ['?form', '?ngForm'],
    restrict: 'A',
    link: function ($scope, $element, $attrs, $controller) {
      var cb = $parse($attrs.formOnChange);
      $element.on('change select input', function(){
        $log.debug($controller);
        cb($scope);
      });
      $scope.$on('$destroy', () => {
        $element.off('change select input');
      });
    }
  };
}