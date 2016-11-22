'use strict'; 

//FILE RESOLUTION DEPENDS ON WEBPACK RESOLVE ROOT IN webpack.config-test

const helpers = require('testing/test.helper');
const assert = helpers.assert;
const expect = helpers.expect;
const spy = helpers.spy; //sinon.spy
const should = helpers.should;
const sinon = helpers.sinon;
const module = helpers.module;
const inject = helpers.inject;
const localStorage = helpers.localStorage;
const sessionStorage = helpers.sessionStorage;
const path = require('path');
const fs = require('fs');
const payload = require('json!testing/application.payload.json');
const appObj = payload.application;
const idObj = {
  quoteId: appObj.quoteId,
  appId: appObj.applicationId,
  ein: appObj.group.employerTaxId
}
require('angular-resource'); //used by data service for application requests

//get the module that contains the core services
require('core/sgApp.core');

describe('Services: ', function() {

  //empty references to nested dependencies
  let mockAuthenticationSvc, mockCookies, mockResource, mockFileSaver, mockBlob, fakeCreateUrl;

  const fakeAPIUrl = '/SpeedERatesWeb/sgaws/rest';

  //dependencies to be injected
  let originalMockStorageSvc, ApplicationSvc, DataSvc, ConstantsSvc, UrlSvc, UserSvc, StorageSvc, $httpBackend, $resource, $window, $timeout, 
    $q, $http, STORAGE_KEYS, API_PATHS, API_ROOT_PATH, createApplicationUrl, getApplicationUrl;

  const idsObj = {
    quoteId: appObj.quoteId,
    appId: appObj.appId
  };

  const mockUrlSvc = {
    getQuoteIdFromUrl : () => idsObj.quoteId,
    getApplication: () => idsObj.appId
  };

  const mockUserSvc = {
    getIsLoggedIn: spy(() => true)
  };

  const mockSpinnerControlSvc = {
    startSpin: () => {},
    stopSpin: () => {}
  };

  let mockStorageSvc = {
    setSessionStore: spy((key, value) => true),
    getSessionStore: spy((key) => undefined)
  };

  beforeEach(() => {
    // load modules, including the module that contains the service
    module('sgAppCore', 'ngResource', ($provide) => {
      $provide.value('$cookies', mockCookies);
      //$provide.value('$resource', mockResource);
      $provide.value('AuthenticationSvc', mockAuthenticationSvc);
      $provide.value('UrlSvc', mockUrlSvc); //urls always return the app or quote id in the fake payload
      $provide.value('UserSvc', mockUserSvc); //user is always logged in
      $provide.value('SpinnerControlSvc', mockSpinnerControlSvc); //does nothing
      $provide.value('FileSaver', mockFileSaver);
      $provide.value('Blob', mockBlob);
      $provide.value('StorageSvc', mockStorageSvc); //working way to spy on storage calls
      // $provide.value('API_URL', fakeAPIUrl); //this should be called in the ApplicationSvc?? (no, it is not)
      // console.log('here is $provide');
      // for (var prop in $provide) {
      //   console.log(prop);
      // }
    });

    inject((_ApplicationSvc_, _DataSvc_, _STORAGE_KEYS_, _API_PATHS_, _API_ROOT_PATH_, _StorageSvc_, _UserSvc_,  
      _ConstantsSvc_, _$httpBackend_, _$resource_, _$window_, _$timeout_, _$q_, _$http_) => {
      ApplicationSvc = _ApplicationSvc_;
      DataSvc = _DataSvc_;
      STORAGE_KEYS = _STORAGE_KEYS_;
      API_PATHS = _API_PATHS_;
      API_ROOT_PATH = _API_ROOT_PATH_;
      StorageSvc = _StorageSvc_;
      UserSvc = _UserSvc_;
      ConstantsSvc = _ConstantsSvc_;
      $httpBackend = _$httpBackend_;
      $resource = _$resource_;
      $window = _$window_;
      $timeout = _$timeout_;
      $q = _$q_;
      $http = _$http_;
      $resource = _$resource_; //resource is also required at top because it's not core angular
    });

    createApplicationUrl = fakeAPIUrl + API_PATHS.createApplication;
    getApplicationUrl = fakeAPIUrl + API_PATHS.getApplication + idsObj.appId;

    //console.log('API_PATHS');
    //console.log(API_PATHS);
    //this is a truncated portion of the create URL turned into a regex
    fakeCreateUrl = new RegExp(API_ROOT_PATH + API_PATHS.createApplication + '(.+)/ein/(.+)');

    $window.localStorage = localStorage; //use fake local and session storage - is testable
    $window.sessionStorage = sessionStorage;

  });

  describe('ApplicationSvc: ', () => {
    
    describe('Creates a new application: ', () => {

      beforeEach(() => {
        originalMockStorageSvc = mockStorageSvc; //set up for overrides
      });

      afterEach(() => {
        mockStorageSvc = originalMockStorageSvc; //return to default mock status
      });

      it('Should check and find that the user is logged in', () => {
        ApplicationSvc.getInitialApplication(idObj);
        
        expect(UserSvc.getIsLoggedIn).to.have.been.called;
        expect(UserSvc.getIsLoggedIn()).to.be.true; //false throws error
      });

      it('Should verify that there is no existing application in local (session) storage', () => {
        ApplicationSvc.getInitialApplication(idObj);
        
        expect(StorageSvc.getSessionStore).to.have.been.calledWith(STORAGE_KEYS.APPLICATION_KEY); //works with mocked StorageSvc
        expect(StorageSvc.getSessionStore(STORAGE_KEYS.APPLICATION_KEY)).to.be.undefined;
        expect(StorageSvc.getSessionStore).to.not.have.returned(appObj);
      });

      it('Should get a new application by calling the Data Service with an ID object containing the quote_id and EIN', () => {
        $httpBackend.when('GET', fakeCreateUrl, undefined, undefined, ['quote_id', 'ein'])
          .respond((method, url, data, headers, params) => {
            // console.log(params);
            // console.log(appObj.quoteId);
            if (appObj.quoteId && params.quote_id && (params.quote_id.toString() === appObj.quoteId.toString())) {
              return [200, payload];
            }
            return [200, {}]; //this case would make the test fail
          });
        $httpBackend.expect('GET', fakeCreateUrl, undefined, undefined, ['quote_id', 'ein']); //rely on backend definition to respond with the fake appObj

        ApplicationSvc.getInitialApplication(idObj).then((response) => {
          // console.log(response);
          // console.log(appObj);
          expect(response).to.deep.equal(appObj);
        });
        
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('Should return an existing application if one exists', () => {
        //save and override the original mockStorageSvc
        originalMockStorageSvc = mockStorageSvc;
        mockStorageSvc.getSessionStore = spy((key) => appObj); //now return an existing application
        ApplicationSvc.getInitialApplication(idObj).then((response) => {
          // console.log(response);
          // console.log(appObj);
          expect(StorageSvc.getSessionStore).to.have.been.calledWith(STORAGE_KEYS.APPLICATION_KEY);
          expect(StorageSvc.getSessionStore).to.have.returned(appObj);
          expect(response).to.deep.equal(appObj);
        });
        mockStorageSvc = originalMockStorageSvc;
      });

    });

    describe('Gets an existing application: ', function() {
      beforeEach(function() {
        originalMockStorageSvc = mockStorageSvc;
        // $httpBackend.when('GET', getApplicationUrl)
        //   .respond((method, url, data, headers, params) => {
        //      return [200, appObj]
        //    });
      });
      it('Should call the Data Service using an application id to get an existing application', function() {
        //$httpBackend.expect('GET', getApplicationUrl);
        mockStorageSvc.getSessionStore = spy((key) => appObj);
        const app = ApplicationSvc.getApplication();
        expect(app).to.deep.equal(appObj);
        //$httpBackend.flush();
      });
      afterEach(function() {
        mockStorageSvc = originalMockStorageSvc;
        // $httpBackend.verifyNoOutstandingExpectation();
        // $httpBackend.verifyNoOutstandingRequest();
      });
    });

  });

});
