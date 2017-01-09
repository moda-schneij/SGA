'use strict';

/**
 * @ngdoc overview
 * @name modaDisableAllInputsDirective
 * @description
 * DisableAllInputs directive of the Small Group Application app.
 * Disables all inputs within a form based on the value of the directive attr
 */

import angular from 'angular';

export default angular.module('modaDisableAllInputsDirective', [])
  .directive('disableAllInputs', disableAllInputsDirectiveFn);

/*@ngInject*/
function disableAllInputsDirectiveFn($log, $timeout, $rootScope) {
  const dDO = {
    restrict: 'A',
    require: ['?form', '?ngForm'],
    scope: {
      disableAllInputs: '=' //evaluated value of the directive attribute
    },
    link: disableAllInputsLinkFn
  }
  return dDO;

  function disableAllInputsLinkFn($scope, $elem, $attrs, ngModelCtrl) {
    
    const deregisterWatch = $scope.$watch(() => $scope.disableAllInputs, (disableVal) => {
      let $inputs;
      let $containedEls;
      if (angular.isDefined(disableVal) && typeof disableVal === 'boolean') {
        $log.debug(disableVal);
        deregisterWatch();
        if (disableVal) {
          $scope.$evalAsync(() => {
            $log.debug(ngModelCtrl);
            $inputs = angular.element($elem
              .querySelectorAll('input, textarea, .prettycheckbox, .prettyradio, .ui-select-container, .numpicker-button'));
            $containedEls = $inputs.find('*');
            $inputs.attr('disabled', 'disabled');
            $containedEls.attr('disabled', 'disabled');
            $inputs.addClass('disabled select2-container-disabled');
            $containedEls.on('click keypress', (e) => {
              prevent(e);
            });
            $inputs.on('click keypress', (e) => {
              prevent(e);
            });
            function prevent(e) {
              e.stopImmediatePropagation();
              e.stopPropagation();
              e.preventDefault();
              $elem.querySelectorAll('.ui-select-dropdown').attr('style', 'display: none !important');
            }
          });
        }
      }
      $scope.$on('$destroy', () => {
        if ($inputs && $inputs.hasOwnProperty('off')) {
          $inputs.off('click keypress');
        }
        if ($containedEls && $containedEls.hasOwnProperty('off')) {
          $containedEls.off('click keypress');
        }
      });
    });
  }
}