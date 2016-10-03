'use strict';

/**
 * @ngdoc overview
 * @name ngBindAttrsDirective
 * @description
 * NgBindAttrs directive of the Small Group Application app.
 */

// import angular from 'angular';
import sgAppCore from '../sgApp.core';

export default angular.module('ngBindAttrsDirective', [])
  .directive('ngBindAttrs', ngBindAttrsDirectiveFn);

/*@ngInject*/
function ngBindAttrsDirectiveFn() {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
      var attrsObj = $scope.$eval($attrs.ngBindAttrs);
      angular.forEach(attrsObj, function(value, key) {
        $attrs.$set(key, value);
      });
      // $scope.$watch(attrs.ngBindAttrs, function(value) {
      //   angular.forEach(value, function(value, key) {
      //     $attrs.$set(key, value);
      //   })
      // }, true);
    }
  };
}