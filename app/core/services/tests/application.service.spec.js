'use strict'; 

//FILE RESOLUTION DEPENDS ON WEBPACK RESOLVE ROOT IN webpack.config-test

const helpers = require('testing/test.helper');
const assert = helpers.assert;
const expect = helpers.expect;
const spy = helpers.spy;
const should = helpers.should;
const sinon = require('sinon');
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
  let ApplicationSvc, DataSvc, ConstantsSvc, UrlSvc, UserSvc, StorageSvc, $httpBackend, $resource, $window, $timeout, 
    $q, $http, API_PATHS, createApplicationUrl, getApplicationUrl;

  const idsObj = {
    quoteId: appObj.quoteId,
    appId: appObj.appId
  };

  const mockUrlSvc = {
    getQuoteIdFromUrl : () => idsObj.quoteId,
    getApplication: () => idsObj.appId
  };

  const mockUserSvc = {
    getIsLoggedIn: spy(function() {
      return true;
    })
  };

  const mockSpinnerControlSvc = {
    startSpin: () => {},
    stopSpin: () => {}
  };

  const mockStorageSvc = {
    setSessionStore: spy((key, value) => true),
    getSessionStore: spy((key) => undefined)
  };

  // const mockDataSvc = {
  //   application: {
  //     create: spy((params) => {
  //       return $http.get('/application/get/quote_id/' + params.quoteId + '/ein/' + params.ein);
  //     })
  //   }
  // };

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
      // $provide.value('DataSvc', mockDataSvc);
      // console.log('here is $provide');
      // for (var prop in $provide) {
      //   console.log(prop);
      // }
    });

    inject((_ApplicationSvc_, _DataSvc_, _API_PATHS_, _StorageSvc_, _UserSvc_,  
      _ConstantsSvc_, _$httpBackend_, _$resource_, _$window_, _$timeout_, _$q_, _$http_) => {
      ApplicationSvc = _ApplicationSvc_;
      DataSvc = _DataSvc_;
      API_PATHS = _API_PATHS_;
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
    fakeCreateUrl = new RegExp(fakeAPIUrl + API_PATHS.createApplication);

    $window.localStorage = localStorage; //use fake local and session storage - is testable
    $window.sessionStorage = sessionStorage;

  });

  describe('ApplicationSvc: ', () => {

    describe('Creates a new application: ', () => {
      beforeEach(() => {
        $httpBackend.when('GET', /.*\/application\/get\/quote_id\/.*/)
          .respond(200, appObj);
      });
      afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
      it('Should call the Data Service using a quote ID to request a new application', () => {
        $httpBackend.expect('GET', /.*\/application\/get\/quote_id\/.*/); //rely on backend definition to respond with the fake appObj

        const promise = ApplicationSvc.getInitialApplication(idObj);

        // ApplicationSvc.getInitialApplication(idObj).then((_response) => {
        //   console.log('response');
        //   console.log(_response);
        //   const response = Boolean(_response.data) ? _response.data : _response;
        //   expect(true).to.be.true;
        //   //expect(response).to.deep.equal(appObj);
        // });
        // expect(promise).to.eventually.deep.equal(appObj);
        // expect(DataSvc.application.create).to.have.been.called();
        expect(UserSvc.getIsLoggedIn).to.have.been.called();
        expect(StorageSvc.getSessionStore).to.have.been.called(); //works with mocked StorageSvc
        //expect(getStoreFn).to.have.been.called();
        //expect(createAppFn).to.have.been.called();
        $httpBackend.flush();
      });
    });

    // describe('Gets an existing application: ', function() {
    //   beforeEach(function() {
    //     $httpBackend.when('GET', getApplicationUrl)
    //       .respond(appObj);
    //   });
    //   it('Should call the Data Service using an application id to get an existing application', function() {
    //     //$httpBackend.expectGET(getApplicationUrl);
    //     ApplicationSvc.getInitialApplication().then(function() {
    //       expect(true).to.be.false;
    //     });
    //     $httpBackend.flush();
    //   });
    //   afterEach(function() {
    //     $httpBackend.verifyNoOutstandingExpectation();
    //     $httpBackend.verifyNoOutstandingRequest();
    //   });
    // });

  });

});
