'use strict';

/**
 * @ngdoc overview
 * @name modelCurrencyDirective
 * @description
 * Model currency directive of the Small Group Application app.
 */

import angular from 'angular';

class ModelCurrencyDirective {
  constructor($parse, $filter, $log) {
    this.require = 'ngModel';
    this.restrict = 'A';
    this.scope = {
      modelCurrency: '='
    };
    this.link = this.linkFn.bind(this);
    this.$parse = $parse;
    this.$filter = $filter;
    this.$log = $log;
  }
  linkFn ($scope, $element, $attrs, ngModelCtrl) {
    const currencyRegex = /^\$?\d*(\.\d{1,2})?$/;
    //if there is no boolean, default to true
    const currencyBool = this.$parse($attrs.modelCurrency)($scope);
    const applyCurrency = angular.isDefined(currencyBool) ? 
      currencyBool : 
      true;

    if (applyCurrency) {
      ngModelCtrl.$formatters.push(dollarFormatter.bind(this));
      ngModelCtrl.$parsers.push(dollarParser.bind(this));
      $element.on('blur', blurHandler.bind(this));
      ngModelCtrl.$viewChangeListeners.push(listernCb.bind(this));
    }

    function blurHandler() {
      const formattedModel = dollarFormatter.call(this, ngModelCtrl.$viewValue);
      ngModelCtrl.$setViewValue(formattedModel);
      ngModelCtrl.$render();
    }

    function dollarFormatter(value) {
      //remove anything but a digit or decimal
      const stringVal = value || value === 0 ? value.toString().replace(/[^\d\.]/g, '') : '';
      //match against a basic currency regex
      const returnVal = stringVal.match(currencyRegex) ? stringVal.match(currencyRegex)[0] : '';
      if (!value || !currencyRegex.test(stringVal) || returnVal.length === 0) {
        return '';
      }
      this.$log.debug('dollarFormatter returnVal: ' + this.$filter('currency')(returnVal));
      return this.$filter('currency')(returnVal);
    }

    function dollarParser(value) {
      const stringVal = value || value === 0 ? value.toString().replace(/[^\d\.]/g, '') : '';
      const returnVal = stringVal.match(currencyRegex) ? stringVal.match(currencyRegex)[0] : '';
      if (!value || stringVal === '' || returnVal.length === 0) {
        return;
      }
      this.$log.debug('dollarParser returnVal: ' + returnVal);
      return returnVal;
    }

    function listernCb() {
      this.$log.debug('viewValue: ' + ngModelCtrl.$viewValue);
    }

    $scope.$on('$destroy', () => {
      $element.off('blur');
    });
  }
  static directiveFactory($parse, $filter, $log) {
    'ngInject';
    return new ModelCurrencyDirective($parse, $filter, $log);
  }
}

export default ModelCurrencyDirective.directiveFactory;