'use strict';

/**
 * @ngdoc overview
 * @name modaPleaseWaitDirective
 * @description
 * ModaPleaseWait button directive of the Small Group Application app.
 */

import angular from 'angular';

class ModaPleaseWaitDirective {
  constructor($http, $timeout) {
    this.restrict = 'A';
    this.require = ['?^form', '?^ngForm'];
    this.$http = $http;
    this.$timeout = $timeout;
  }
  link($scope, $element, $attrs, ngModelCtrl) {
    const isButton = $element.is('button');
    const isInput = $element.is('input');
    const origVal = isInput ? $element.val() : $element.text();
    const textVal = isInput ? 'val' : 'text';
    $element.on('click', pleaseWait.bind(this));
    function pleaseWait() {
      if (this.$http.pendingRequests && this.$http.pendingRequests.length > 0) {
        $element.addClass('wait-button');
        $element[textVal]('Please wait...');
        this.$timeout(pleaseWait.bind(this), 5);
      } else {
        $element.removeClass('wait-button');
        $element[textVal](origVal);
      }
    }
  }
  
  static directiveFactory($http, $timeout) {
    'ngInject';
    return new ModaPleaseWaitDirective($http, $timeout)
  }
}

export default ModaPleaseWaitDirective.directiveFactory;