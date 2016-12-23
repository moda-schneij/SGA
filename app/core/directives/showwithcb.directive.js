'use strict';

/**
 * @ngdoc overview
 * @name sgApp.directive:animateCb
 * @description
 * # Animate callback
 * Directive of the Moda Small Group Application app
 */

class ShowWithCbDirective {
  constructor($animate) {
    this.restrict = 'A';
    this.link = this.linkFn.bind(this);
    this.$animate = $animate;
    this.scope = {
      'animateCb': '=',
      'afterShow': '&',
      'afterHide': '&',
      'ngIf': '=',
      'ngShow': '='
    };
    this.link = this.linkFn.bind(this);
  }

  linkFn(scope, element, attrs) {
    const {$animate} = this;
    const attrToObserve = attrs['ngIf'] ? 'ngIf' : (attrs['ngShow'] ? 'ngShow' : 'showWithCb');
    scope.$watch(attrToObserve, (show) => {
      if (show) {
        $animate.removeClass(element, 'ng-hide').then(scope.afterShow);
      }
      if (!show) {
        $animate.addClass(element, 'ng-hide').then(scope.afterHide);
      }
    });
  }

  static directiveFactory($animate) {
    'ngInject';
    return new ShowWithCbDirective($animate);
  }
}

export default ShowWithCbDirective.directiveFactory;
