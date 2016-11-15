'use strict';

/**
 * @ngdoc overview
 * @name modelIntegerDirective
 * @description
 * Model integer directive of the Small Group Application app.
 */

import angular from 'angular';

class ModelIntegerDirective {

  constructor(UtilsSvc) {
    this.UtilsSvc = UtilsSvc;
    this.require = 'ngModel';
    this.restrict = 'A';
    this.scope = {
      maxValue: '@',
      minValue: '@'
    };
    this.link = this.linkFn.bind(this);
  }

  linkFn($scope, $element, $attrs, ngModelCtrl) {

    //validators
    ngModelCtrl.$validators.exceedsMax = (modelVal, viewVal) => {
      if ($attrs.maxValue && !ngModelCtrl.$isEmpty(modelVal)) {
        //negate the condition you want to test (return false means invalid)
        return !(parseInt(modelVal, 10) > parseInt($attrs.maxValue, 10));
      }
      return true;
    };

    ngModelCtrl.$validators.belowMin = (modelVal, viewVal) => {
      if ($attrs.minValue && !ngModelCtrl.$isEmpty(modelVal)) {
        //negate the condition you want to test (return false means invalid)
        return !(parseInt($attrs.minValue, 10) > parseInt(modelVal, 10));
      }
      return true;
    };

    ngModelCtrl.$validators.notNumber = (modelVal, viewVal) => {
      if (!ngModelCtrl.$isEmpty(modelVal) && !this.UtilsSvc.isNumberOrNumString(modelVal)) {
        return false;
      }
      return true;
    };
  }

  static directiveFactory(UtilsSvc) {
    'ngInject';
    return new ModelIntegerDirective(UtilsSvc);
  }
}

export default ModelIntegerDirective.directiveFactory;