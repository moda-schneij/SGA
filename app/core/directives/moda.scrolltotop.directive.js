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
  constructor($log, $window, $timeout, $transitions) {
    this.restrict = 'A';
    this.$log = $log;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$transitions = $transitions;
    this.scrollUp = this.scrollUp.bind(this);
  }

  link($scope, $elem, $attrs) {
    this.$transitions.onSuccess({}, () => {
      this.$timeout(this.scrollUp, 500);
    });
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

  static directiveFactory($log, $window, $timeout, $transitions) {
    'ngInject';
    return new ModaScrollToTopDirective($log, $window, $timeout, $transitions);
  }
}

export default ModaScrollToTopDirective.directiveFactory;
