'use strict';

/**
 * @ngdoc overview
 * @name sgApp.directive:ngTipso
 * @description
 * # ngTipso
 * Directive of the Moda Small Group Application app
 */

//Angular wrapper for jquery Tipso
//https://github.com/object505/tipso

class NgTipsoDirective {
  constructor() {
    this.restrict = 'A';
    this.link = this.linkFn.bind(this);
  }
  linkFn(scope, element, attrs, modelCtrl) {
    $(element).tipso(scope.$eval(attrs.ngTipso));
  }
  static directiveFactory() {
    return new NgTipsoDirective();
  }
}

export default NgTipsoDirective.directiveFactory;
