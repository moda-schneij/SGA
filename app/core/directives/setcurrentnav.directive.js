'use strict';

/**
 * @ngdoc overview
 * @name setCurrentNavDirective
 * @description
 * SetCurrentNav directive of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('setCurrentNavDirective', [])
  .directive('setCurrentNav', setCurrentNavDirectiveFn);

/*@ngInject*/
function setCurrentNavDirectiveFn($location) {
  return {
    restrict: 'A', //use as attribute 
    link: function(scope, elem) {
      //after the route has changed
      scope.$on('$routeChangeSuccess', function() {
        const pathText = $location.path().replace(/[\/,#,!,\.\.\.]/g, '');
        angular.forEach(elem.find('a'), function(a) {
          const link = angular.element(a);
          const hrefText = link.attr('href').replace(/[\/,#,!]/g, '');
          if (pathText === hrefText) {
            link.parent().addClass('current');
          } else {
            link.parent().removeClass('current');
          }
        });
      });
    }
  }
}
