'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:messages
 * @description
 * # Messages
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class MessagesSvc {

  /*@ngInject*/
  constructor($log, $q, $rootScope, SpinnerControlSvc, MESSAGE_TYPES) {
    this.$log = $log;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.SpinnerControlSvc = SpinnerControlSvc;
    this.MESSAGE_TYPES = MESSAGE_TYPES;
    this.messageObj = {};
    this.messagesArr = []; //provisional holder for registered messages
  }

  registerErrors(errors) {
    this.messageObj.type = 'errors';
    register.call(this, errors);
  }

  registerAlerts(alerts) {
    this.messageObj.type = 'alerts';
    register.call(this, alerts);
  }

  registerMessages(messages) {
    this.messageObj.type = 'messages';
    register.call(this, messages);
  }

  clearErrors() {
    this.messageObj.type = 'errors';
    clear.call(this);
  }

  clearMessages() {
    this.messageObj.type = 'messages';
    clear.call(this);
  }

  clearAlerts() {
    this.messageObj.type = 'alerts';
    clear.call(this);
  }

  clearAll() {
    this.messageObj.type = 'all';
    clear.call(this);
  }

  updateMessages(e, args, vm) {
    this.$log.debug('the MessagesSvc has triggered the following event: ');
    this.$log.debug(e);
    this.$log.debug(args);
    const messageType = args.type ? args.type : 'errors'; //errors, messages, alerts, or all (for action "clear" only)
    const action = args.action ? args.action : 'register'; //register or clear ()
    const messages = args.messages ? args.messages : []; //an array of messages of the supplied type - if empty, will invoke "clear all"
    
    angular.forEach(this.MESSAGE_TYPES, function(val, key) {
      const displayBool = 'has' + val.charAt(0).toUpperCase() + val.substring(1);
      if (messageType !== 'all') {
        setMessagesToDisplay.apply(this, [vm, val, displayBool, messageType, messages]);
      } else { //for clear all
        setMessagesToHide.apply(this, [vm, displayBool]);
      }
    }, this);
  }

}

function setMessagesToDisplay(vm, val, displayBool, messageType, messages) {
  vm[val] = messageType === val && messages.length >= 1 ? messages : [];
  vm[displayBool] = vm[val].length > 0 && vm[val][0] !== '';
  this.$log.debug(displayBool + ': ' + vm[displayBool]);
  this.$log.debug(val + ': ');
  this.$log.debug(vm[val]);
}

function setMessagesToHide(vm, displayBool) {
  vm[displayBool] = false; //set all three message display booleans to false
}

function clear() {
  const self = this;
  const dataObj = {
    action: 'clear',
    type: self.messageObj.type
  };
  self.$rootScope.$broadcast('updateMessages', dataObj);
}

function register(messages) {
  const self = this;
  const isArray = angular.isArray(messages);
  const isString = angular.isString(messages);
  const isObject = angular.isObject(messages) && !angular.isArray(messages);
  const dataObj = {
    action: 'register',
    type: self.messageObj.type
  };

  //empty the messages array
  self.messagesArr = [];

  if (isString) {
    self.messagesArr.push(messages);
  }

  if (isArray) {
    self.messagesArr = messages;
  }

  if (isObject) {
    angular.forEach(messages, function (value, key) {
      if (angular.isString(value)) {
        self.messagesArr.push(messages);
      }
      if (angular.isArray(value)) {
        self.messagesArr = messages;
      }
      if (angular.isObject(value)) {
        angular.forEach(value, function (nestedVal, nestedKey) {
          self.messagesArr.push(nestedVal);
        })
      }
    });
  }

  dataObj.messages = self.messagesArr;

  self.$rootScope.$broadcast('updateMessages', dataObj);
}
