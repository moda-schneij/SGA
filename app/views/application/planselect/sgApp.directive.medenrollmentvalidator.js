'use strict';

/**
 * @ngdoc overview
 * @name medEnrollmentValidator
 * @description
 * Medical enrollment validator directive of the Plan Selection Component of the Small Group Application app.
 */

import angular from 'angular';
import sgAppRoot from '../../../root/sgApp.component.root'; //this directive is defined on the root module and injected there

export default angular.module(sgAppRoot.name)
  .directive('medEnrollmentValidator', medEnrollmentValidatorDirectiveFn);

/*@ngInject*/
function medEnrollmentValidatorDirectiveFn($parse, $timeout) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: ($scope, $element, $attrs, ngModelCtrl) => {
      function validityParser(viewValue) {
        $timeout(() => {
          //passing in the value of rateType.matchesTotalCount (a value caculated on each rate-type: EE, ES, EF, or EC)
          const validator = $parse($attrs.medEnrollmentValidator)($scope);
          if (validator) { //if the option is passed correctly
            const rateTypeTotalTestExists = validator.hasOwnProperty('rateTypeTotalTest');
            const planTotalTestExists = validator.hasOwnProperty('planTotalTest');
            if (rateTypeTotalTestExists) {
              ngModelCtrl.$setValidity('matchestotalenrollment', validator.rateTypeTotalTest);
            }
            if (planTotalTestExists) {
              ngModelCtrl.$setValidity('noplanenrollments', validator.planTotalTest);
            }
          }
        });
        return viewValue;
      }
      ngModelCtrl.$parsers.unshift(validityParser);
      validityParser(ngModelCtrl.$viewValue);
    }
  };
}