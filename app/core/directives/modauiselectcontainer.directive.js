'use strict';

/**
 * @ngdoc overview
 * @name modaUiSelectContainerDirective
 * @description
 * ModaUiSelectContainer directive of the Small Group Application app.
 * Adds validation classes to enclosed input of ui-selects
 */

import angular from 'angular';

export default angular.module('modaUiSelectContainerDirective', [])
  .directive('modaUiSelectContainer', modaUiSelectContainerDirectiveFn);

/*@ngInject*/
function modaUiSelectContainerDirectiveFn($log) {
  return {
    restrict: 'AC',
    controller: function($scope, $element, $attrs) {
      const $input = $element.find('input');
      const validationClassRegEx = /valid|pristine|touched|empty/;
      if ($input && $input.length === 1) {
        const inputClasses = $input.attr('class').split(' ');
        let lastClassChanges = [];
        const deregisterClassWatcher = $scope.$watch(() => $element.attr('class'), (classList) => {
          const uiSelectClasses = classList.split(' ').filter((className) => validationClassRegEx.test(className));
          angular.forEach(lastClassChanges, (className) => { //clear out last updated classes from the parent ui-select
            $input.removeClass(className);
          });
          lastClassChanges = []; //reset the lastClassChanges array
          angular.forEach(uiSelectClasses, (className) => {
            if (inputClasses.indexOf(className) === -1) { //add back new classes from the parent
              lastClassChanges.push(className);
              $input.addClass(className);
            }
          });
        });
      }
    }
  };
}