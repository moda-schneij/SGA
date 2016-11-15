'use strict';

/**
 * @ngdoc overview
 * @name ngBindAttrsDirective
 * @description
 * NgBindAttrs directive of the Small Group Application app.
 */

import angular from 'angular';

/*@ngInject*/
class NgBindAttrsDirective {
  constructor() {
    this.restrict = 'A';
    this.controller = NgBindAttrsCtrl;
  }
  static directiveFactory() {
    return new NgBindAttrsDirective();
  }
}

class NgBindAttrsCtrl {
  constructor($scope, $element, $attrs) {
    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;
    this.attrsObj = $scope.$eval($attrs.ngBindAttrs);
    angular.forEach(this.attrsObj, function(value, key) {
      $attrs.$set(key, value);
    });
  }
}

export default NgBindAttrsDirective.directiveFactory;