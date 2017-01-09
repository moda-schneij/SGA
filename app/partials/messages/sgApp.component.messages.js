'use strict';

/**
 * @ngdoc overview
 * @name footerComponent
 * @description
 * Footer component of the Small Group Application app.
 */

/* This component is a currently kind of a wrapper for the directive I just created, and AFAIK, I could 
dispense of the component altogether and just use a directive, but I've used up too much time working
on this task ATM, so may put it down as technical debt to refactor. Also, ng-messages... (not used yet
in an Angular app here)*/

import angular from 'angular';
import sgAppRoot from '../../root/sgApp.component.root';

export default angular
  .module('sgAppRoot')
  .component('messages', {
    template: '<moda-messages parentctrl="$ctrl" ng-show="$ctrl.hasAnyMessages" shown="{{$ctrl.hasAnyMessages}}" class="grow-down"></moda-messages>',
    bindings: {
      isloggedin: '<'
    },
    controller: MessagesCtrl
  });
  
/*@ngInject*/
function MessagesCtrl($log, $scope, $timeout, MessagesSvc, MESSAGE_TYPES) {
  var vm = this;
  
  vm.$onInit = () => {
    angular.forEach(MESSAGE_TYPES, function(val, key) {
      const displayBool = getDisplayBool(val);
      vm[val] = [];
      vm[displayBool] = false;
      $log.debug(displayBool + ': ' + vm[displayBool]);
      $log.debug(val + ': ');
      $log.debug(vm[val]);
    });
    setComputedProps(vm, MESSAGE_TYPES);
  };
    
  /* eslint-disable angular/on-watch */ //this is a global event handler that shouldn't be destroyed (afaik)

  $scope.$on('updateMessages', function (e, args) {
    $scope.$evalAsync(() => {
      MessagesSvc.updateMessages(e, args, vm);
    });
  });

  /* eslint-enable angular/on-watch */

}

function getDisplayBool(val) {
  return 'has' + val.charAt(0).toUpperCase() + val.substring(1);
}

function setComputedProps(vm, MESSAGE_TYPES) {
  const displayBoolArr = MESSAGE_TYPES.map((msgType) => getDisplayBool(msgType));
  Object.defineProperty(vm, 'hasAnyMessages', {
    get: () => displayBoolArr.filter((displayBool) => vm[displayBool]).length > 0,
    enumerable: true,
    configurable: true
  });
}