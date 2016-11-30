'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * decorators module of the Small Group Application app.
 */

/*
**  each name/function pair in decorators is passed to the application's config
**  (sgApp.config), thusly:
**  Object.keys(decorators).forEach((name) => $provide.decorator(name, decorators[name]));
*/

const decorators = {
  //the 3rd-party hNumberDirective needs decoration for behavior, styling, and "form-ability" (evaluation for validation, etc, with its parent form)
  hNumberDirective: ($delegate, $timeout, $log, $parse, $interpolate, $compile) => {
    'ngInject';
    const directive = $delegate[0]; //grab the directive that is being decorated (the first element of the $delegate array)
    directive.scope.ctrl = '='; //this is the vm passed to the numpicker as the "ctrl" attribute
    const compile = directive.compile; //the compile method of the decorated directive
    let ctrlName;
    
    directive.compile = function(tElement, tAttrs) { //now we call the compile fn
      const link = compile.apply(this, arguments); //and create a link variable by calling compile with context and args
      //now do decorated compile stuff
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
        .addClass('numpicker-number');

      return function($scope, $elem, $attrs) {
        const vm = $scope.ctrl;
        const modelVal = $interpolate($attrs.value)($scope);
        const _val = $scope.value ? $scope.value : 0;
        let formCtrl;
        let formCtrlName;
        let inputCtrlName;
        let inputCtrl;
        let $input;

        ctrlName = $interpolate($attrs.name)($scope);

        link.apply(this, arguments); //now call link (created within our decorator's compile), with context and args
        //now do decorated link (postlink) stuff
        
        //here is where an input can be inserted, with interpolated ng-model and name attributes
        $elem.find('.numpicker-number')
          .wrapInner('<input name="' + $attrs.name + '" ng-model="' + $attrs.value + '" class="numpicker-value"></input>');
        //this input must now be compiled against scope to register with the parent form (ngModelCtrl)
        $compile($elem.contents())($scope);
        $input = $elem.find('.numpicker-value');
        
        //get all form control names in the current viewmodel
        let formCtrlNames = Object.keys(vm).filter((prop) => vm[prop] && vm[prop].constructor && 
          vm[prop].constructor.name && 
          vm[prop].constructor.name === 'FormController');
        if (angular.isArray(formCtrlNames) && formCtrlNames.length > 1) {
          formCtrlName = formCtrlNames.filter((name) => {
            return Object.keys(vm[name]).filter((prop) => prop === ctrlName).length > 0;
          });
        } else {
          formCtrlName = angular.isArray(formCtrlNames) ? formCtrlNames[0] : null;
        }
        formCtrl = formCtrlName ? vm[formCtrlName] : null;
        inputCtrlName = formCtrl ? Object.keys(formCtrl).filter((prop) => prop === ctrlName) : null;
        inputCtrl = inputCtrlName && formCtrl ? formCtrl[inputCtrlName] : null;
        $timeout(() => { //kludge to make the view value update on the decorated directive, on load
          if (inputCtrl && angular.isFunction(inputCtrl.$setViewValue)) {
            inputCtrl.$setViewValue(_val);
          }
          $input.val(_val);
        });
        $scope.$watch(
          () => $scope.value,
          (newVal, oldVal) => {
            if (newVal !== oldVal) {
              const _newVal = newVal ? newVal : 0;
              $input.val(_newVal);
              if (inputCtrl && angular.isFunction(inputCtrl.$setViewValue)) {
                inputCtrl.$setViewValue(_newVal);
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