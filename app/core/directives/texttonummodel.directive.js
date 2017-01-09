'use strict';

/**
 * @ngdoc overview
 * @name TextToNumModelDirective
 * @description
 * Text to number modele directive of the Small Group Application app.
 */

import angular from 'angular';

class TextToNumModelDirective {
  constructor($parse, $log) {
    this.$parse = $parse;
    this.$log = $log;
    this.require = 'ngModel';
    this.restrict = 'A';
    this.link = this.linkFn.bind(this);
  }
  linkFn($scope, $element, $attrs, ngModelCtrl) {
    const opt = this.$parse($attrs.textToNumModel)($scope);
    const parseAsFloat = opt && opt.float || false;

    ngModelCtrl.$formatters.push(numFormatter.bind(this));
    ngModelCtrl.$parsers.push(stringParser.bind(this));
    ngModelCtrl.$viewChangeListeners.push(listernCb.bind(this));

    function numFormatter(value) {
      return value ? value.toString() : '0';
    }
    
    function stringParser(value) {
      return value ? 
        (parseAsFloat ? parseFloat(value) : parseInt(value, 10)) : 0; //default is to parse as integer.
        //for parseAsFloat, do not fix decimals here, but using filters in the view
    }

    function listernCb() {
      this.$log.debug('viewValue: ' + ngModelCtrl.$viewValue);
    }

  }
  static directiveFactory($parse, $log) {
    'ngInject';
    return new TextToNumModelDirective($parse, $log);
  }
}

export default TextToNumModelDirective.directiveFactory;