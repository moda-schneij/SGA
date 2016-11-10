'use strict';

/**
 * @ngdoc overview
 * @name formOnChangeDirective
 * @description
 * FormOnChange directive of the Small Group Application app.
 */

import angular from 'angular';

class FormOnChangeDirective {
  constructor($parse, $log) {
    this.restrict = 'A';
    this.require = ['?form', '?ngForm'];
    this.$parse = $parse;
    this.$log = $log;
  }
  link($scope, $element, $attrs, $controller) {
    const cb = this.$parse($attrs.formOnChange);
    $element.on('change select input', function(){
      this.$log.debug($controller);
      cb($scope);
    });
    $scope.$on('$destroy', () => {
      $element.off('change select input');
    });
  }
  static directiveFactory($parse, $log) {
    'ngInject';
    return new FormOnChangeDirective($parse, $log);
  }
}

export default FormOnChangeDirective.directiveFactory;