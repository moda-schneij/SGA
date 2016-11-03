'use strict';

/**
 * @ngdoc overview
 * @name modaPleaseWaitDirective
 * @description
 * ModaPleaseWait button directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('modaPleaseWaitDirective', [])
  .directive('modaPleaseWait', modaPleaseWaitDirectiveFn);

/*@ngInject*/
function modaPleaseWaitDirectiveFn($log, $http, $timeout) {
  return {
    require: ['?^form', '?^ngForm'],
    restrict: 'A',
    link: function ($scope, $element, $attrs, ngModelCtrl) {
      const isButton = $element.is('button');
      const isInput = $element.is('input');
      const origVal = isInput ? $element.val() : $element.text();
      const textVal = isInput ? 'val' : 'text';
      $element.on('click', pleaseWait);
      function pleaseWait() {
        if ($http.pendingRequests && $http.pendingRequests.length > 0) {
          $element.addClass('wait-button');
          $element[textVal]('Please wait...');
          $timeout(pleaseWait, 5);
        } else {
          $element.removeClass('wait-button');
          $element[textVal](origVal);
        }
      }
    }
  };
}