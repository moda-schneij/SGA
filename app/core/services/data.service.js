'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:data
 * @description
 * # Data
 * Service of the Small Group Application App
 */

import angular from 'angular';

export default class DataSvc {

  /*@ngInject*/
  constructor($http, $log, $q, FileSaver, Blob, UserSvc, ConstantsSvc, StorageSvc, $resource, $timeout, $rootScope, API_PATHS, STORAGE_KEYS) {
    this.$http = $http;
    this.$log = $log;
    this.$q = $q;
    this.FileSaver = FileSaver;
    this.Blob = Blob;
    this.UserSvc = UserSvc;
    this.ConstantsSvc = ConstantsSvc;
    this.StorageSvc = StorageSvc;
    this.$resource = $resource;
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;
    this.API_PATHS = API_PATHS;
    this.SER_CONTEXT_ROOT = ConstantsSvc.SER_CONTEXT_ROOT;
    this.API_URL = ConstantsSvc.API_URL;
    this.CONTENT_KEY = STORAGE_KEYS.CONTENT_KEY;
    this.APPLICATION_KEY = STORAGE_KEYS.APPLICATION_KEY;
    this.APPID = STORAGE_KEYS.APPID_KEY;
  }

  checkIsSuccess(response) {
    const success = response.status === 200 && response.statusText.toLowerCase() === 'ok';
    return success;
  }

  ping() {
    const pingUrl = this.API_URL + this.API_PATHS.ping;
    const reqConfig = {
      method: 'GET',
      url: pingUrl
    };
    return this.$http(reqConfig);
  }

  get application() {
    const self = this;
    const saveAppUrl = this.API_URL + this.API_PATHS.saveApplication;
    const submitAppUrl = this.API_URL + this.API_PATHS.submitApplication;
    const enrollAppUrl = this.API_URL + this.API_PATHS.enrollApplication;
    const deleteAppUrl = this.API_URL + this.API_PATHS.deleteApplication;
    const checkinAppUrl = this.API_URL + this.API_PATHS.checkinApplication;
    const manualAppUrl = this.API_URL + this.API_PATHS.manualApplication;
    const reqConfig = {
      method: 'POST',
      url: saveAppUrl
    };
    return {
      save: function(data) {
        reqConfig.data = data ? angular.toJson({ application: data }) : angular.toJson({
          application: self.StorageSvc.getSessionStore(self.APPLICATION_KEY)
        });
        return self.$http(reqConfig);
      },
      submit: function(data) {
        reqConfig.data = data ? angular.toJson({ application: data }) : angular.toJson({
          application: self.StorageSvc.getSessionStore(self.APPLICATION_KEY)
        });
        reqConfig.url = submitAppUrl;
        return this.save(data);
      },
      enroll: function(data) {
        reqConfig.data = data ? angular.toJson({ application: data }) : angular.toJson({
          application: self.StorageSvc.getSessionStore(self.APPLICATION_KEY)
        });
        reqConfig.url = enrollAppUrl;
        return this.save(data);
      },
      get: function(appId) {
        const idObj = {
          appId: appId
        };
        return retrieveApplication.call(self, idObj);
      },
      create: function(paramsObj) { //paramsObj will contain quoteId and ein
        return retrieveApplication.call(self, paramsObj);
      },
      checkin: (appId) => {
        reqConfig.url = checkinAppUrl + appId;
        return this.$http(reqConfig);
      },
      delete: (appdata) => {
        reqConfig.data = angular.toJson({
          application: appdata ? appdata : self.StorageSvc.getSessionStore(self.APPLICATION_KEY)
        });
        reqConfig.url = deleteAppUrl;
        return this.$http(reqConfig);
      },
      setManual: (appdata) => {
        reqConfig.data = angular.toJson({
          application: appdata ? appdata : self.StorageSvc.getSessionStore(self.APPLICATION_KEY)
        });
        reqConfig.url = manualAppUrl;
        return this.$http(reqConfig);
      },
      download: (appId) => {
        const _appId = appId ? appId : self.StorageSvc.getSessionStore(self.APPID_KEY);
        let contentDisposition;

        const url = this.API_URL + this.API_PATHS.getPDF + '/id/' + _appId + '/grgr_ck/0';
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
          if ((/4/).test(this.readyState)) {
            if ((/200/).test(this.status)) {
              const blob = new self.Blob([this.response], { type: 'application/octet-stream' });
              const fileName = contentDisposition && angular.isString(contentDisposition) ? 
                contentDisposition.split(';') //split this header into its parts
                .filter((val) => (/filename/i).test(val))[0] //extract the filename part of this header
                .replace((/"/g), '') //filter out extra quotes if they're there
                .split('=')[1] : //get the filename itself from the key/val pair
                'application.pdf'; //fallback
              self.FileSaver.saveAs(blob, fileName);
            } else if (this.responseText !== '') {
              this.$log.debug(this.responseText);
            }
          } else if ((/2/).test(this.readyState)) {
            contentDisposition = xhr.getResponseHeader('Content-Disposition');
            if ((/200/).test(this.status)) {
              this.responseType = 'blob';
            } else {
              this.responseType = 'text';
            }
          }
        };
        xhr.send(null);
      }
    };
  }

  getNAICSCodes(search) {
    const naicsData = {
      search: search
    }
    const NAICSCodes = this.$resource(this.API_URL + this.API_PATHS.getNAICSCodes + '/:search');
    return NAICSCodes.get(naicsData).$promise;
  }

  getReps() {
    const repsUrl = this.API_URL + this.API_PATHS.getReps;
    const reqConfig = {
      method: 'GET',
      url: repsUrl
    };
    return this.$http(reqConfig);
  }

  getStates() {
    const statesUrl = this.API_URL + this.API_PATHS.getStates;
    const reqConfig = {
      method: 'GET',
      url: statesUrl
    };
    return this.$http(reqConfig);
  }

  getApplicationList() {
    const appListUrl = this.API_URL + this.API_PATHS.getAppList;
    const reqConfig = {
      method: 'GET',
      url: appListUrl
    };
    return this.$http(reqConfig);
  }

  getEligibilityPeriods() {
    const eligPeriodUrl = this.API_URL + this.API_PATHS.getEligibilityPeriods;
    const reqConfig = {
      method: 'GET',
      url: eligPeriodUrl
    };
    return this.$http(reqConfig);
  }

  // getFooterContent() {
  //   //const footerUrl = 'http://4mmhn32.pdx.odshp.com:9001/-/item/v1/?sc_itemid={E934515E-2EA0-4F9B-890C-912FC467488A}&fields={5E1D9123-EB61-4684-9E59-DF1171FF97A1}';
  //   const footerUrl = 'http://wcm.stg2.modahealth.com/-/item/v1/?sc_itemid={E934515E-2EA0-4F9B-890C-912FC467488A}&fields={5E1D9123-EB61-4684-9E59-DF1171FF97A1}';
  //   const deferred = this.$q.defer();
  //   const reqConfig = {
  //     method: 'GET',
  //     url: footerUrl
  //   };
  //   this.$http(reqConfig).success(function(response) {
  //     this.$log.debug('SiteCore content: ');
  //     this.$log.debug(response['result']['items'][0]['Fields']['{5E1D9123-EB61-4684-9E59-DF1171FF97A1}']['Value']);
  //     deferred.resolve(response['result']['items'][0]['Fields']['{5E1D9123-EB61-4684-9E59-DF1171FF97A1}']['Value']);
  //   }.bind(this));
  //   return deferred.promise;
  // }

  getFooterContent() {
    return this.getFooterContentDummy();
  }

  getFooterContentDummy() {
    const deferred = this.$q.defer();
    const returnVal = `
      <p>Copyright &copy; <span id=\"dct-global-footer-date\"></span>
      <script>document.getElementById('dct-global-footer-date').innerHTML=new Date().getFullYear();</script>
      Moda, Inc. All Rights Reserved.<br/>
      Health plans in Oregon, Alaska and Washington provided by Moda Health Plan, Inc. 
      Health plans in California provided by Moda Health Plan, Inc. dba Moda Health Insurance. 
      Dental insurance products in Oregon provided by Oregon Dental Service. 
      Dental insurance products in Alaska provided by Delta Dental of Alaska.</p>
    `
    this.$timeout(function() {
      deferred.resolve(returnVal);
    }, 0);
    return deferred.promise;
  }

}
//end of class, beginning of helper fns

function retrieveApplication(paramsObj) {
  const createNewApplication = !!paramsObj.quoteId; //cast as boolean
  const getExistingApplication = !!paramsObj.appId;
  const einPathFragment = '/ein/' + (paramsObj.ein ? paramsObj.ein : ''); //if for any reason ein is missing with quoteId, pass it as an empty string
  const apiPath = createNewApplication ? this.API_PATHS.createApplication :
    getExistingApplication ? this.API_PATHS.getApplication :
    false;
  if (apiPath) {
    let reqUrl = '';
    if (createNewApplication) {
      //reqUrl = this.API_URL + apiPath + paramsObj.quoteId + einPathFragment;
      const AppResource = this.$resource(this.API_URL + this.API_PATHS.createApplicationResource, {quote_id:'@quote_id',ein:'@ein'});
      return AppResource.get({quote_id: paramsObj.quoteId, ein: paramsObj.ein}).$promise;
    }
    if (getExistingApplication) {
      reqUrl = this.API_URL + apiPath + paramsObj.appId;
    }
    return this.$http.get(reqUrl);
  }
}
