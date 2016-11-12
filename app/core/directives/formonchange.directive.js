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
    this.link = this.linkFn.bind(this);
    this.$parse = $parse;
    this.$log = $log;
  }
  linkFn($scope, $element, $attrs, $controller) {
    /* no isolate scope here, do not parse the attribute 
    ** (a callback function 
    ** on the parent controller) against scope 
    */
    const cb = this.$parse($attrs.formOnChange);
    $element.on('change select input', () => {
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