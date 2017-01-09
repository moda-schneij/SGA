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

class ModaMessagesDirective {
  constructor($window) {
    this.restrict = 'AE';
    this.templateUrl = './app/core/directives/templates/messages.html';
    this.scope = {};
    this.bindToController = {
      parentctrl: '=' //access the parent controller, in this case - see the note about using both a component and directive
    };
    this.controller = ModaMessagesCtrl;
    this.controllerAs = '$ctrl';
    this.$window = $window;
  }
  link($scope, $elem, $attrs, ngModelCtrl) {
    $attrs.$observe('shown', (newVal) => {
      if ((newVal && newVal !== 'false') || newVal === 'true') { //only do this when messages are being shown, not removed
        const $body = angular.element(this.$window.document.scrollingElement);
        if (angular.isFunction($body.duScrollTo)) {
          $body.duScrollTo(0, 0, 500); //scroll up with easing
        } else {
          $body.scrollTo(0, 0); //scroll up to the top when there's an error
        }
      }
    });
  }
  static directiveFactory($window) {
    'ngInject';
    return new ModaMessagesDirective($window);
  }
}

/*@ngInject*/
class ModaMessagesCtrl {
  constructor() {
    this.messageTypes = [
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
    this.hideMessages = this.hideMessagesFn.bind(this);
  }

  //the new messages directive has a close button, and all it does is set the message booleans all to false
  hideMessagesFn(displayVal) {
    this.parentctrl[displayVal] = false;
  }
}

export default ModaMessagesDirective.directiveFactory;
