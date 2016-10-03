'use strict';

/**
 * @ngdoc overview
 * @name modaScrollToTopDirective
 * @description
 * ModaScrollToTop directive of the Small Group Application app.
 * Scrolls the component to top on init
 */

import angular from 'angular';

export default angular.module('modaScrollToTopDirective', [])
  .directive('scrollToTop', modaMessagesDirectiveFn);

/*@ngInject*/
function modaMessagesDirectiveFn($log, $window, $timeout) {
  const dDO = {
    restrict: 'A',
    link: modaScrollToTopLinkFn
  }
  return dDO;

  function modaScrollToTopLinkFn($scope, $elem, $attrs) {
    const routeChangeWatcher = $scope.$on('$routeChangeSuccess', () => {
      $timeout(scrollUp, 500);
    });
    $scope.$on('$destroy', routeChangeWatcher);
  }

  function scrollUp() {
    $log.debug('route changed');
    const $body = angular.element($window.document.scrollingElement);
    if (angular.isFunction($body.duScrollTo)) {
      $body.duScrollTo(0, 0, 500); //scroll up with easing
    } else {
      $body.scrollTo(0, 0); //scroll up to the top when there's an error
    }
  }
}