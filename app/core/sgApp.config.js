'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * Config module of the Small Group Application app.
 */

const PROD = __PROD__ || false;
/*eslint-disable*/
const MODA = window.MODA || {};
/*eslint-enable*/
MODA.SGA = MODA.SGA || {};

/*@ngInject*/
export default function sgaConfig($httpProvider, $logProvider, $locationProvider, $sceDelegateProvider, usSpinnerConfigProvider, ngDialogProvider, uiSelectConfig, $provide) {
  $httpProvider.interceptors.push('AuthInterceptorSvc');
  $logProvider.debugEnabled(!PROD); //disable debug logging in production
  $locationProvider.html5Mode(false);
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our parent context application.  Notice the difference between * and **.
    MODA.baseDomain + '**'
  ]);
  usSpinnerConfigProvider.setDefaults({
    lines: 11,
    length: 15,
    width: 8,
    radius: 18,
    rotate: 37,
    trail: 66,
    speed: 0.8
  });
  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default',
    showClose: false,
    closeByEscape: false,
    closeByDocument: false
  });
  uiSelectConfig.theme = 'select2';
  uiSelectConfig.resetSearchInput = true;
  //decorate the number picker directive
  $provide.decorator('hNumberDirective', ($delegate, $timeout, $log, $parse) => {
    'ngInject';
    const directive = $delegate[0];
    directive.scope.ctrl = '='; //this is the vm passed to the numpicker
    const compile = directive.compile;
    directive.compile = function(tElement, tAttrs) {
      const link = compile.apply(this, arguments);
      const spans = tElement.find('.input-group-addon');
      angular.element(spans[0])
        .addClass('input-group-addon-left numpicker-button numpicker-decrement')
        .wrapInner('<span class="numpicker-button-text"></span>');
      angular.element(spans[1])
        .addClass('input-group-addon-right numpicker-button numpicker-increment')
        .wrapInner('<span class="numpicker-button-text"></span>');
      angular.element(tElement)
        .addClass('numpicker')
        .find('.input-group-addon ~ label')
        .addClass('numpicker-number')
        .wrapInner('<input name="" ng-model="ctrl.dummy" class="numpicker-value"></input>');

      return function($scope, $elem, $attrs, ngModelCtrl) {
        link.apply(this, arguments);
        const _val = $scope.value ? $scope.value : 0;
        const $input = $elem.find('.numpicker-value');
        $input.attr('name', $attrs.name)
          .attr('ng-model', $attrs.value)
          .val(_val);
        $scope.$watch(
          () => $scope.value,
          (newVal, oldVal) => {
            const _newVal = newVal ? newVal : 0;
            const vm = $scope.ctrl; //to test later for existence
            $input.val(_newVal);
            if (newVal !== oldVal && angular.isDefined(vm)) {
              angular.forEach(vm, (val, key) => {
                if (angular.isObject(val) && val.hasOwnProperty('$setDirty') && angular.isFunction(val.$setDirty)) {
                  val.$setDirty();
                  if (angular.isFunction(val.$setTouched)) {
                    val.$setTouched();
                  }
                }
              });
            }
          }
        );
      };
    };
    return $delegate;
  });
}