'use strict';

/**
 * @ngdoc overview
 * @name modelPercentageDirective
 * @description
 * Model percentage directive of the Small Group Application app.
 */

import angular from 'angular';

class ModelPercentageDirective {
  constructor($parse, $log, UtilsSvc) {
    this.$parse = $parse;
    this.$log = $log;
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
    //if there is no boolean, default to true
    const percentageBool = this.$parse($attrs.modelPercentage)($scope);
    const applyPercentage = angular.isDefined(percentageBool) ?
      percentageBool :
      true;

    if (applyPercentage) {
      ngModelCtrl.$formatters.push(pctFormatter.bind(this));
      ngModelCtrl.$parsers.push(pctParser.bind(this));
      $element.on('blur', blurHandler.bind(this));
      ngModelCtrl.$viewChangeListeners.push(listernCb.bind(this));
    }

    function blurHandler() {
      const formattedVal = pctFormatter(ngModelCtrl.$viewValue);
      ngModelCtrl.$setViewValue(formattedVal);
      ngModelCtrl.$render();
    }

    function pctFormatter(value) {
      const stringVal = value || value === 0 ? value.toString().replace('%', '') : '';
      if (stringVal === '') {
        return '';
      }
      return stringVal + '%';
    }

    function pctParser(value) {
      const stringVal = value || value === 0 ? value.toString().replace('%', '') : '';
      if (!value || stringVal === '') {
        return;
      }
      return stringVal;
    }

    function listernCb() {
      this.$log.debug('viewValue: ' + ngModelCtrl.$viewValue);
    }

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

    $scope.$on('$destroy', () => {
      $element.off('blur');
    });
  }

  static directiveFactory($parse, $log, UtilsSvc) {
    'ngInject';
    return new ModelPercentageDirective($parse, $log, UtilsSvc);
  }
}

export default ModelPercentageDirective.directiveFactory;
