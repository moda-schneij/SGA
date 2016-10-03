'use strict';

/**
 * @ngdoc overview
 * @name checkFormEmptyDirective
 * @description
 * Check form empty directive of the Small Group Application app.
 */

// import angular from 'angular';
import sgAppCore from '../sgApp.core';

export default angular.module('checkFormEmptyDirective', [])
  .directive('checkFormEmpty', checkFormEmptyDirectiveFn);

/*@ngInject*/
function checkFormEmptyDirectiveFn($parse, $filter, $log) {
  let deregisterWatch;
  return {
    require: ['?ngForm', '?form'],
    restrict: 'A',
    link: function ($scope, $element, $attrs, formCtrl) {
      const ctrlsArr = [];
      const thisCtrl = formCtrl.filter((val) => !!val)[0];
      if (angular.isObject(thisCtrl)) {
        proceedWithCheck();
      }
      function proceedWithCheck() {
        angular.forEach(thisCtrl, (prop) => { //thisCtrl should be an object, which ever form or ng-form has the directive on it
          if (angular.isObject(prop)) {
            if (prop.hasOwnProperty('$isEmpty')) {
              ctrlsArr.push(prop); //push to the array - or, this means the form isn't empty, so just set that attr
            }
          }
        });
        deregisterWatch = $scope.$watchCollection(() => thisCtrl, () => {
          checkFormEmptyFn();
        });

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

        checkFormEmptyFn(); //do this also on form load
      }
      
    }
  };
}