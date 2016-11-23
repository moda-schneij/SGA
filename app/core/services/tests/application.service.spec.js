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
let idObj = {
  quoteId: appObj.quoteId,
  appId: appObj.applicationId,
  ein: appObj.group.employerTaxId
};
require('angular-resource'); //used by data service for application requests

//get the module that contains the core services
require('core/sgApp.core');

describe('Services: ', function() {

  //empty references to nested dependencies
  let originalMockStorageSvc, originalIdObj, mockAuthenticationSvc, mockCookies, mockResource, mockFileSaver, mockBlob, fakeCreateUrl, fakeGetUrl;

  const fakeAPIUrl = '/SpeedERatesWeb/sgaws/rest';

  //dependencies to be injected
  let ApplicationSvc, DataSvc, ConstantsSvc, UrlSvc, UserSvc, StorageSvc, $httpBackend, $resource, $window, $timeout, 
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
    //the '(.+)' portions are param placeholders that can be accessed during execution by $httpBackend
    fakeCreateUrl = new RegExp(API_ROOT_PATH + API_PATHS.createApplication + '(.+)/ein/(.+)');
    fakeGetUrl = new RegExp('.*' + API_ROOT_PATH + API_PATHS.getApplication + '(.+)');

    $window.localStorage = localStorage; //use fake local and session storage - is testable
    $window.sessionStorage = sessionStorage;

  });

  describe('ApplicationSvc: ', () => {
    
    describe('Creates a new or returns an existing application on startup (getInitialApplication): ', () => {

      beforeEach(() => {
        originalIdObj = Object.assign({}, idObj);
        originalMockStorageSvc = Object.assign({}, mockStorageSvc); //set up for overrides
      });

      afterEach(() => {
        idObj = originalIdObj;
        mockStorageSvc = originalMockStorageSvc; //return to default original state
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

      it('Should get a new application via XHR when passing the quote_id and EIN', () => {
        idObj.appId = null; //leave quoteId and ein
        $httpBackend.when('GET', fakeCreateUrl, undefined, undefined, ['quote_id', 'ein']) //array injects params for httpBackend (see URL regex)
          .respond((method, url, data, headers, params) => {
            if (appObj.quoteId && params.quote_id && (params.quote_id.toString() === appObj.quoteId.toString())) {
              return [200, payload];
            }
            return [200, {}]; //this case would make the test fail
          });
        //rely on backend definition to respond with the fake appObj
        $httpBackend.expect('GET', fakeCreateUrl, undefined, undefined, ['quote_id', 'ein']); 
          
        ApplicationSvc.getInitialApplication(idObj).then((response) => {
          expect(response).to.deep.equal(appObj);
        });
        
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('Should return an existing application if one exists in browser storage', () => {
        //now return an existing application
        mockStorageSvc.getSessionStore = spy((key) => appObj);
        ApplicationSvc.getInitialApplication(idObj).then((response) => {
          expect(StorageSvc.getSessionStore).to.have.been.calledWith(STORAGE_KEYS.APPLICATION_KEY);
          expect(StorageSvc.getSessionStore).to.have.returned(appObj);
          expect(response).to.deep.equal(appObj);
        });
      });

      it('Should fetch (XHR) an existing application by ID if none exists in browser storage', () => {
        idObj.ein = null; //leave only appId
        idObj.quoteId = null;
        $httpBackend.when('GET', fakeGetUrl, undefined, undefined, ['id']) //array injects params for httpBackend (see URL regex)
          .respond((method, url, data, headers, params) => {
            if (appObj.applicationId && params.id && (params.id.toString() === appObj.applicationId.toString())) {
              return [200, payload];
            }
            return [200, {}]; //this case would make the test fail
          });
        $httpBackend.expect('GET', fakeGetUrl, undefined, undefined, ['id']);        
        ApplicationSvc.getInitialApplication(idObj).then((response) => {
          expect(StorageSvc.getSessionStore).to.have.been.calledWith(STORAGE_KEYS.APPLICATION_KEY);
          expect(StorageSvc.getSessionStore(STORAGE_KEYS.APPLICATION_KEY)).to.be.undefined;
          expect(response).to.deep.equal(appObj);
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
    });

    describe('Gets an existing application from browser storage (getApplication): ', function() {
      beforeEach(function() {
        originalMockStorageSvc = Object.assign({}, mockStorageSvc);
      });
      it('Should Storage Service using an application id to get an existing application', function() {
        mockStorageSvc.getSessionStore = spy((key) => appObj);
        const app = ApplicationSvc.getApplication();
        expect(app).to.deep.equal(appObj);
      });
      afterEach(function() {
        mockStorageSvc = originalMockStorageSvc;
      });
    });

    describe('Restores existing application state from the database (restoreApplication): ', function() {
      beforeEach(function() {
        originalMockStorageSvc = Object.assign({}, mockStorageSvc);
        $httpBackend.when('GET', fakeGetUrl, undefined, undefined, ['id'])
          .respond((method, url, data, headers, params) => {
            if (params.id && appObj.applicationId && (params.id.toString() === appObj.applicationId.toString())) {
              return [200, payload];
            }
            return [200, {}]; //this case would make the test fail
          });
      });
      it('Should call the Data Service to get an existing application using an id from browser storage', function() {
        $httpBackend.expect('GET', fakeGetUrl);
        //now return an appid from mock session storage
        mockStorageSvc.getSessionStore = spy((key) => idObj.appId);
        ApplicationSvc.restoreApplication().then((app) => {
          expect(app).to.deep.equal(appObj);
        });
        $httpBackend.flush();
      });
      it('Should return false if there is no application ID in browser storage', function() {
        ApplicationSvc.restoreApplication().then((response) => {
          expect(response).to.be.false;
        });
      });
      afterEach(function() {
        mockStorageSvc = originalMockStorageSvc;
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
    });

  });

});
