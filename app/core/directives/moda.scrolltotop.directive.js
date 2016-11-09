'use strict';

/**
 * @ngdoc overview
 * @name modaScrollToTopDirective
 * @description
 * ModaScrollToTop directive of the Small Group Application app.
 * Scrolls the component to top on init
 */

import angular from 'angular';

class ModaScrollToTopDirective {
  constructor() {
    this.restrict = 'A';
    //this.scrollUp = this.scrollUp.bind(this);
    this.controller = ModaScrollToTopController;
  }

  link($scope, $elem, $attrs, ctrl) {
    const routeChangeWatcher = $scope.$on('$routeChangeSuccess', () => {
      ctrl.$timeout(this.scrollUp.bind(ctrl), 500);
    });
    $scope.$on('$destroy', routeChangeWatcher);
  }

  scrollUp() {
    this.$log.debug('route changed');
    const $body = angular.element(this.$window.document.scrollingElement);
    if (angular.isFunction($body.duScrollTo)) {
      $body.duScrollTo(0, 0, 500); //scroll up with easing
    } else {
      $body.scrollTo(0, 0); //scroll up to the top when there's an error
    }
  }

  static directiveFactory() {
    return new ModaScrollToTopDirective();
  }
}

class ModaScrollToTopController {
  /*@ngInject*/
  constructor($log, $window, $timeout) {
    this.$log = $log;
    this.$window = $window;
    this.$timeout = $timeout;
  }
}

export default ModaScrollToTopDirective.directiveFactory;