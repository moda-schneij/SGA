'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * decorators module of the Small Group Application app.
 */

const decorators = {
  hNumberDirective: ($delegate, $timeout, $log, $parse, $interpolate) => {
    'ngInject';
    const directive = $delegate[0];
    directive.scope.ctrl = '='; //this is the vm passed to the numpicker
    const compile = directive.compile;
    let ctrlName;
    
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
        .wrapInner('<input name="' + tAttrs.name + '" ng-model="' + tAttrs.value + '" class="numpicker-value"></input>');

      return function($scope, $elem, $attrs) {
        link.apply(this, arguments);
        ctrlName = $interpolate($attrs.name)($scope);
        const $input = $elem.find('.numpicker-value');
        $input
          .attr('name', $attrs.name);
        const vm = $scope.ctrl;
        let formCtrlName = Object.keys(vm).filter((prop) => vm[prop] && vm[prop].constructor && 
          vm[prop].constructor.name && 
          vm[prop].constructor.name === 'FormController');
        const _val = $scope.value ? $scope.value : 0;
        $timeout(() => { //kludge to make the view value update on the decorated directive, on load
          $input.val(_val);
        });
        $scope.$watch(
          () => $scope.value,
          (newVal, oldVal) => {
            if (newVal !== oldVal) {
              const _newVal = newVal ? newVal : 0;
              if (angular.isArray(formCtrlName) && formCtrlName.length > 1) {
                formCtrlName = formCtrlName.filter((name) => {
                  return Object.keys(vm[name]).filter((prop) => prop === ctrlName).length > 0;
                });
              }
              const formCtrl = vm[formCtrlName];
              const inputCtrlName = Object.keys(formCtrl).filter((prop) => prop === ctrlName);
              const inputCtrl = formCtrl[inputCtrlName];
              if (inputCtrl && angular.isFunction(inputCtrl.$setViewValue)) {
                inputCtrl.$setViewValue(_newVal);
              }
              if (_newVal) {
                $timeout(() => { //kludge to make the view value update on the decorated directive, on load
                  $input.val(_newVal);
                });
              }
              if (inputCtrl && angular.isFunction(inputCtrl.$setDirty)) {
                inputCtrl.$setDirty();
                if (angular.isFunction(inputCtrl.$setTouched)) {
                  inputCtrl.$setTouched();
                }
              }
              if (angular.isFunction(formCtrl.$setDirty)) {
                formCtrl.$setDirty();
              }
              if (angular.isFunction(formCtrl.$setTouched)) {
                formCtrl.$setTouched();
              }
            }
          }
        );
      };
    };
    return $delegate;
  }
};

export default decorators;