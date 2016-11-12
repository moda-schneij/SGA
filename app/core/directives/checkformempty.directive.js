'use strict';

/**
 * @ngdoc overview
 * @name checkFormEmptyDirective
 * @description
 * Check form empty directive of the Small Group Application app.
 */

import angular from 'angular';

class CheckFormEmptyDirective {
  constructor($log) {
    this.restrict = 'A';
    this.require = ['?ngForm', '?form'];
    this.link = this.linkFn.bind(this);
    this.scope = {};
    this.$log = $log;
  }
  
  linkFn($scope, $element, $attrs, formCtrl) {
    let deregisterWatch;
    const ctrlsArr = [];
    const thisCtrl = formCtrl.filter((val) => !!val)[0];
    if (angular.isObject(thisCtrl)) {
      proceedWithCheck.call(this);
    }
    function proceedWithCheck() {
      angular.forEach(thisCtrl, (prop) => { //thisCtrl should be an object, which ever form or ng-form has the directive on it
        // this.$log.debug('prop in form control: ' + angular.toJson(prop));
        if (angular.isObject(prop)) {
          if (prop.hasOwnProperty('$isEmpty')) {
            ctrlsArr.push(prop); //push to the array - or, this means the form isn't empty, so just set that attr
          }
        }
      });

      deregisterWatch = $scope.$watchCollection(() => thisCtrl, () => {
        checkFormEmptyFn();
      });

      // this.$log.debug('controls in each form: ');
      // this.$log.debug(ctrlsArr);

      $element.find('input').on('blur', checkFormEmptyFn);
      
      function checkFormEmptyFn() {
        const filteredCtrlsArr = ctrlsArr.filter((ctrl) => !ctrl.$isEmpty(ctrl.$viewValue));
        if (filteredCtrlsArr.length > 0) {
          $element.addClass('form-not-empty');
          $element.removeClass('form-empty');
        } else {
          $element.addClass('form-empty');
          $element.removeClass('form-not-empty');
        }
      }

      $scope.$on('$destroy', () => {
        $element.find('input').off('blur');
        deregisterWatch();
      });

      checkFormEmptyFn.call(this); //do this also on form load
    }
  }
  static directiveFactory($log) {
    'ngInject';
    return new CheckFormEmptyDirective($log);
  }
}

export default CheckFormEmptyDirective.directiveFactory;