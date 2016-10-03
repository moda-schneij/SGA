'use strict';

/**
 * @ngdoc overview
 * @name modaMessagesDirective
 * @description
 * ModaMessages directive of the Small Group Application app.
 */

/* This direcvie is a currently called by a messages component and, AFAIK, I could 
dispense of the component altogether and just use this directive, but I've used up too much time working
on this task ATM, so may put it down as technical debt to refactor. Also, ng-messages... (not used yet
in an Angular app here)*/

import angular from 'angular';

export default angular.module('modaMessagesDirective', [])
  .directive('modaMessages', modaMessagesDirectiveFn);

/*@ngInject*/
function modaMessagesDirectiveFn($parse, $log, $window) {
  const dDO = {
    restrict: ['A', 'E'],
    templateUrl: './app/core/directives/templates/messages.html',
    scope: {},
    bindToController: {
      parentctrl: '=' //access the parent controller, in this case - see the note about using both a component and directive
    },
    controller: ModaMessagesCtrl,
    controllerAs: '$ctrl',
    link: modaMessagesLinkFn
  }
  return dDO;

  function modaMessagesLinkFn($scope, $elem, $attrs, ngModelCtrl) {
    $attrs.$observe('shown', (newVal) => {
      if ((newVal && newVal !== 'false') || newVal === 'true') { //only do this when messages are being shown, not removed
        const $body = angular.element($window.document.scrollingElement);
        if (angular.isFunction($body.duScrollTo)) {
          $body.duScrollTo(0, 0, 500); //scroll up with easing
        } else {
          $body.scrollTo(0, 0); //scroll up to the top when there's an error
        }
      }
    });
  }
}

/*@ngInject*/
function ModaMessagesCtrl() {
  const vm = this;
  vm.messageTypes = [
    {
      id: 'svcAlerts',
      iconType: 'error',
      type: 'alerts',
      role: 'alert',
      ariaLive: 'assertive',
      displayVal: 'hasAlerts'
    },
    {
      id: 'infoMessages',
      iconType: 'info',
      type: 'messages',
      role: 'status',
      ariaLive: 'polite',
      displayVal: 'hasMessages'
    },
    {
      id: 'errorMessages',
      iconType: 'error',
      type: 'errors',
      role: 'alert',
      ariaLive: 'assertive',
      displayVal: 'hasErrors'
    }
  ];
  //the new messages directive has a close button, and all it does is set the message booleans all to false
  vm.hideMessages = (displayVal) => {
    vm.parentctrl[displayVal] = false;
  }
}
