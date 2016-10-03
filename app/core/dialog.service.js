'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:dialogs
 * @description
 * # Dialogs
 * Service of the Small Group Application app
 */
 
import angular from 'angular';
const moduleName = 'sgAppDialogSvc';
const _template = './app/core/templates/dialog.html';

class DialogSvc {

  /*@ngInject*/
  constructor($injector, $rootScope) {
    this.$injector = $injector;
    this.$rootScope = $rootScope;
  } //injecting injector here and referencing ngDialog as a variable in the enclosed function
  //this is to avoid a circular dependency created by ngDialog's $get injecting the $compile service directly

  confirm(data, options) {
    const optionsObj = options || {};
    const _data = transformData.apply(this, [data, 'confirm']);
    return dialog.apply(this, [_template, _data, optionsObj, 'openConfirm']);
  }

  acknowledge(data, options) {
    const optionsObj = options || {};
    const _data = transformData.apply(this, [data, 'acknowledge']);
    return dialog.apply(this, [_template, _data, optionsObj, 'open']);
  }

}

function dialog(template, data, options, type) {
  const ngDialog = this.$injector.get('ngDialog');
  const configObj = angular.extend({}, options, {template: template, data: data});
  if (data.scope) {
    configObj.scope = data.scope;
  }
  const currentDialog = ngDialog[type](configObj);
  //for an acknowledge dialog, the promise is returned from closePromise, otherwise on confirm, it's returned from the dialog itself
  return currentDialog.hasOwnProperty('closePromise') ? currentDialog.closePromise : currentDialog;
}

function transformData(data, type) {
  var confirmation = type === 'confirm';
  const returnData = data;

  //massge the config according to the type, setting some defaults in case the options aren't passed
  returnData.heading = data.heading ? data.heading : confirmation ? 'Continue or cancel?' : 'Please confirm';
  returnData.cancelButton = data.cancelButton ? data.cancelButton : confirmation ? 'Cancel' : '';
  returnData.confirmButton = data.confirmButton ? data.confirmButton : 'OK';
  
  if (data.scope) {
    const _scope = data.scope;
    const _$rootScope = this.$rootScope;
    //if scope is passed as a boolean, use $rootScope as scope
    returnData.scope = !angular.isObject(_scope) ? _$rootScope : _scope;    
  }

  return returnData;
}

export default angular
  .module(moduleName, ['ngDialog'])
  .service('DialogSvc', DialogSvc);
