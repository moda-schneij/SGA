'use strict';

/**
 * @ngdoc overview
 * @name sgApp.module:ngTiso
 * @description
 * # ngTipso
 * Module of the Moda Small Group Application app
 */
 
import angular from 'angular';

//Angular wrapper for jquery Tipso
//https://github.com/object505/tipso

class NgTipsoDirective {
  constructor() {
    this.restrict = 'A',
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