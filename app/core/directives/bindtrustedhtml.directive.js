'use strict';

/**
 * @ngdoc overview
 * @name bindTrustedHtmlDirective
 * @description
 * BindTrustedHtml directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('bindTrustedHtmlDirective', [])
  .directive('bindTrustedHtml', bindTrustedHtmlDirectiveFn);

/*@ngInject*/
function bindTrustedHtmlDirectiveFn($log) {
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      const el = $element[0];
      $scope.$watch(function() {
        return $attrs.bindTrustedHtml;
      }, function(newVal, oldVal) {
        $element.html(newVal);
      });
    }
  }
}