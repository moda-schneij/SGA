'use strict';

/**
 * @ngdoc overview
 * @name bindTrustedHtmlDirective
 * @description
 * BindTrustedHtml directive of the Small Group Application app.
 */

import angular from 'angular';

class BindTrustedHtmlDirective {
  constructor() {
    this.restrict = 'A';
  }
  link($scope, $element, $attrs) {
    const el = $element[0];
    $scope.$watch(function() {
      return $attrs.bindTrustedHtml;
    }, function(newVal, oldVal) {
      $element.html(newVal);
    });
  }
  static directiveFactory() {
    return new BindTrustedHtmlDirective();
  }
}

export default BindTrustedHtmlDirective.directiveFactory;
