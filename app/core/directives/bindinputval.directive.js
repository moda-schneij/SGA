'use strict';

/**
 * @ngdoc overview
 * @name bindInputValDirective
 * @description
 * BindInputVal directive of the Small Group Application app.
 */

import angular from 'angular';

class BindInputValDirective {
  constructor($parse, UtilsSvc) {
    this.restrict = 'A';
    this.require = ['?ngModel', '?ngValue'];
    this.$parse = $parse;
    this.UtilsSvc = UtilsSvc;
  }
  link($scope, $elem, $attrs) {
    const bindOpt = this.$parse($attrs.bindInputVal)($scope);
    const parseAsFloat = bindOpt && bindOpt.parse && (/float/i).test(bindOpt.parse);
    const parseAsInt = bindOpt && bindOpt.parse && (/int/i).test(bindOpt.parse);
    $attrs.$observe('value', (val) => {
      const _val = !isNaN(val) && angular.isNumber(val) ? 
        this.UtilsSvc.stripCommas(val.toString()) : angular.isString(val) && val !== '' ? 
        this.UtilsSvc.stripCommas(val) : false;
      const valToBind = parseAsFloat ? 
        parseFloat(_val) : 
        parseAsInt ? parseInt(_val, 10) : 
        _val ? _val : 0;
      const $model = this.$parse($attrs.ngModel);
      $model.assign($scope, valToBind);
    });
  }
  static directiveFactory($parse, UtilsSvc) {
    'ngInject';
    return new BindInputValDirective($parse, UtilsSvc);
  }
}

export default BindInputValDirective.directiveFactory;