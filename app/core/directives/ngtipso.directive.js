'use strict';

/**
 * @ngdoc overview
 * @name sgApp.module:ngTiso
 * @description
 * # ngTipso
 * Module of the Moda Small Group Application app
 */
 
import angular from 'angular';

export default angular.module('ngTipsoDirective', [])
  .directive('ngTipso', ngTipsoDirectiveFn);

//Angular wrapper for jquery Tipso
//https://github.com/object505/tipso

/*@ngInject*/
function ngTipsoDirectiveFn() {
  return {
    restrict: 'A',
    link: (scope, element, attrs, modelCtrl) => {
      $(element).tipso(scope.$eval(attrs.ngTipso));
    }
  }
}
