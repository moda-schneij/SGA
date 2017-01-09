'use strict';

/**
 * @ngdoc overview
 * @name modelFloatDirective
 * @description
 * Model float directive of the Small Group Application app.
 */

import angular from 'angular';

class ModelFloatDirective {
  constructor($filter, UtilsSvc) {
    this.require = 'ngModel';
    this.restrict = 'A';
    this.scope = {
      maxValue: '@',
      minValue: '@'
    };
    this.link = this.linkFn.bind(this);
    this.$filter = $filter;
    this.UtilsSvc = UtilsSvc;
  }
  linkFn($scope, $element, $attrs, ngModelCtrl) {
    $element.on('blur', blurHandler.bind(this));

    //parser and formatter
    ngModelCtrl.$formatters.push(floatFormatter.bind(this));
    ngModelCtrl.$parsers.push(floatParser.bind(this));

    function floatFormatter(value) {
      return this.$filter('number')(value, 2);
    }

    function floatParser(value) {
      return parseFloat(value).toFixed(2);
    }

    function blurHandler() {
      const formattedModel = floatFormatter.call(this, ngModelCtrl.$viewValue);
      ngModelCtrl.$setViewValue(formattedModel);
      ngModelCtrl.$render();
    }

    //validators
    ngModelCtrl.$validators.exceedsMax = (modelVal, viewVal) => {
      if ($attrs.maxValue && !ngModelCtrl.$isEmpty(modelVal)) {
        //negate the condition you want to test (return false means invalid)
        return !(parseFloat(modelVal).toFixed(2) > parseFloat($attrs.maxValue).toFixed(2));
      }
      return true;
    };

    ngModelCtrl.$validators.belowMin = (modelVal, viewVal) => {
      if ($attrs.minValue && !ngModelCtrl.$isEmpty(modelVal)) {
        //negate the condition you want to test (return false means invalid)
        return !(parseFloat($attrs.minValue).toFixed(2) > parseFloat(modelVal).toFixed(2));
      }
      return true;
    };

    ngModelCtrl.$validators.notNumber = (modelVal, viewVal) => {
      if (!ngModelCtrl.$isEmpty(modelVal) && !this.UtilsSvc.isNumberOrNumString(modelVal)) {
        return false;
      }
      return true;
    };

    $scope.$on('$destroy', () => {
      $element.off('blur');
    });

  }
  static directiveFactory($filter, UtilsSvc) {
    'ngInject';
    return new ModelFloatDirective($filter, UtilsSvc);
  }
}

export default ModelFloatDirective.directiveFactory;