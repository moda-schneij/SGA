'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:content
 * @description
 * # Content
 * Service of the Small Group Application app
 */

//this is a service for communicating with SpeedERates through a hidden iframe using postMessage
//the iframe is in the root component - could also be in the template
//it is always there so we can pass tokens, login, and logout from SGA

export default class ContentSvc {

  /*@ngInject*/
  constructor ($log, StorageSvc, DataSvc, $q, $sce, STORAGE_KEYS) {
    this.$log = $log;
    this.StorageSvc = StorageSvc;
    this.$q = $q;
    this.$sce = $sce;
    this.CONTENT_KEY = STORAGE_KEYS.CONTENT_KEY;
    this.DataSvc = DataSvc;
  }

  getFooterContent(content) {
    const {$q, $log, $sce, StorageSvc, CONTENT_KEY, DataSvc} = this;
    const existingContent = StorageSvc.getLocalStore(CONTENT_KEY) || {};
    return $q(returnFooterContent);
    function returnFooterContent(resolve) {
      if (existingContent.footer) {
        resolve($sce.trustAsHtml(existingContent.footer));
      } else {
        DataSvc.getFooterContent().then((response) => {
          setFooterContent(response, resolve);
        }, (error) => {
          handleError(error, resolve);
        });
      }
    }
    function setFooterContent(response, resolve) {
      existingContent.footer = response;
      StorageSvc.setLocalStore(CONTENT_KEY, existingContent);
      resolve($sce.trustAsHtml(response));
    }
    function handleError(error, resolve) {
      $log.error('error getting footer content', error);
      resolve('');
    }
  }
  //foo

}
