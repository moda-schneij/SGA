'use strict';

/**
 * @ngdoc overview
 * @name prettySelectCheckboxDirective
 * @description
 * PrettySelectCheckbox directive of the Small Group Application app.
 * For adding a styled checkbox in the select options of an angular ui-select component
 */

import angular from 'angular';

class PrettySelectCheckboxDirective {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.restrict = 'E';
    this.require = '^^uiSelect';
    this.link = this.linkFn.bind(this);
  }
  linkFn ($scope, $element, $attrs, ngModelCtrl) {
    //const $siblingEl = $element.parents('.ui-select-choices-row').find('.option-pretty-checkbox');
    const $parent = $element.parent().parent(); //this is (should be) the ui select row
    //TODO - think about other ways to target this element using native querySelector or jQLite (in case jquery isn't available)
    const $boundEl = $parent.find('.ng-binding');
    $parent.on('click', '*:not(a)', handleSelect); //bind all clicks
    $parent.on('mousedown', 'a', handleSelect); //bind mousedown to the checkbox itself, to prevent default
    function handleSelect(e) {
      if (!e.continue) { //use a click event data setting to trigger the select delay function one time
        delaySelect(e);
      }
    }
    function delaySelect(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      const $targetEl = angular.element(e.target);
      const isCheckbox = $targetEl.is('a');
      const $elToChange = isCheckbox ? $targetEl : $element.find('a');
      const notDisabled = !($elToChange.is('.disabled'));
      if (notDisabled) {
        $elToChange.toggleClass('checked');
      }
      const isChecked = $elToChange.is('.checked');
      if (isChecked) {
        this.$timeout(() => { 
          $boundEl.trigger({type: 'click', continue: true}) 
        }, 500);
      }
    }
  }
  static directiveFactory($timeout) {
    'ngInject';
    return new PrettySelectCheckboxDirective($timeout);
  }
}

export default PrettySelectCheckboxDirective.directiveFactory;