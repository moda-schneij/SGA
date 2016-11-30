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
    directive.require = '^form'; //make sure the control is nested in a form/ngForm
    const compile = directive.compile; //ref to the compile method of the decorated directive
    let ctrlName;
    
    directive.compile = function(tElement, tAttrs) { //now we call the compile fn
      //and create a link ref variable by calling compile method ref with the directive as context and template el attrs as args
      const link = compile.apply(this, arguments); 
      //now do decorated compile stuff
      const spans = tElement.find('.input-group-addon');
      //add a bunch of extra classes and elements for styling
      //these are all static/structural decorations, so can go in compile instead of link
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

      return function($scope, $elem, $attrs, formCtrl) {
        const _val = $scope.value ? $scope.value : 0;
        let inputCtrlName;
        let inputCtrl;
        let $input;

        ctrlName = $interpolate($attrs.name)($scope);
        /*now call link ref (created within our decorator's compile), 
        with context (the directive) and link fn args (scope, elem, attrs, formctrl)*/
        link.apply(this, arguments); 
        //now do decorated link (ie, postlink) stuff
        //here is where an input can be inserted, with interpolated ng-model and name attributes
        $elem.find('.numpicker-number')
          .prepend('<input type="text" name="' + $attrs.name + '" ng-model="' + $attrs.value + '" ' + 
            'class="numpicker-value"" />');
        //this input must now be compiled against scope to register with the parent form (ngModelCtrl)
        $compile($elem.contents())($scope);
        $input = $elem.find('.numpicker-value'); //get a ref to the newly added input
        
        inputCtrlName = formCtrl ? Object.keys(formCtrl).filter((prop) => prop === ctrlName) : null;
        inputCtrl = inputCtrlName && formCtrl ? formCtrl[inputCtrlName] : null;

        if (inputCtrl && angular.isFunction(inputCtrl.$setViewValue)) {
          inputCtrl.$setViewValue(_val);
          inputCtrl.$commitViewValue();
        }

        $scope.$watch(
          () => $scope.value,
          (newVal, oldVal) => {
            if (newVal !== oldVal) {
              const _newVal = newVal ? newVal : 0;
              if (inputCtrl && angular.isFunction(inputCtrl.$setViewValue)) {
                inputCtrl.$setViewValue(_newVal);
                inputCtrl.$commitViewValue();
                $input.val(_newVal);
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