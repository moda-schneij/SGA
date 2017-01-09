'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:content
 * @description
 * # Content
 * Service of the Small Group Application app
 */

const moduleName = 'sgAppContentSvc';

//this is a service for communicating with SpeedERates through a hidden iframe using postMessage
//the iframe is in the root component - could also be in the template
//it is always there so we can pass tokens, login, and logout from SGA

class ContentSvc {
  
  /*@ngInject*/
  constructor ($log, StorageSvc, DataSvc, $q, STORAGE_KEYS) {
    this.$log = $log;
    this.StorageSvc = StorageSvc;
    this.$q = $q;
    this.CONTENT_KEY = STORAGE_KEYS.CONTENT_KEY;
    this.DataSvc = DataSvc;
  }

  getFooterContent(content) {
    const deferred = this.$q.defer();
    const existingContent = this.StorageSvc.getSessionStore(this.CONTENT_KEY) || {}; //this should be set as an empty object in the app run block;
    if (existingContent.footer) {
      deferred.resolve(existingContent.footer);
    } else {
      this.DataSvc.getFooterContent().then(setFooterContent.bind(this), handleError.bind(this));
    }
    function setFooterContent(response) {
      existingContent.footer = response;
      this.StorageSvc.setSessionStore(this.CONTENT_KEY, existingContent);
      deferred.resolve(response);
    }
    function handleError(error) {
      this.$log.error('error getting footer content');
      this.$log.error(error);
      deferred.resolve('');
    }
    return deferred.promise;    
  }
  
}

export default angular
  .module(moduleName, [])
  .service('ContentSvc', ContentSvc);
