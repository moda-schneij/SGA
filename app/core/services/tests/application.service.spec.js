'use strict'; 

//FILE RESOLUTION DEPENDS ON WEBPACK RESOLVE ROOT IN webpack.config-test

const helpers = require('testing/test.helper');
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

const expect = require('chai').expect;
const assert = require('chai').assert;

describe('Services: ', function() {

  //empty references to nested dependencies
  let mockAuthenticationSvc, mockCookies, mockResource, mockFileSaver, mockBlob, fakeCreateUrl;

  const fakeAPIUrl = '/SpeedERatesWeb/sgaws/rest';

  //dependencies to be injected
  let ApplicationSvc, DataSvc, ConstantsSvc, UrlSvc, StorageSvc, $httpBackend, $resource, $window, $timeout, 
    $q, API_PATHS, createApplicationUrl, getApplicationUrl;

  const idsObj = {
    quoteId: appObj.quoteId,
    appId: appObj.appId
  };

  const mockUrlSvc = {
    getQuoteIdFromUrl : () => idsObj.quoteId,
    getApplication: () => idsObj.appId
  };

  const mockUserSvc = {
    getIsLoggedIn: function() {
      return true;
    }
  };

  const mockSpinnerControlSvc = {
    startSpin: () => {},
    stopSpin: () => {}
  };

  const mockDataSvc = {
    application: {
      create: (id) => {

      },
      get: (id) => {

      },
      checkin: (id) => {

      },
      delete: (id) => {

      },
      setManual: (id) => {

      }
    }
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
      // $provide.value('API_URL', fakeAPIUrl); //this should be called in the ApplicationSvc?? (no, it is not)
      // $provide.value('DataSvc', mockDataSvc);
      // console.log('here is $provide');
      // for (var prop in $provide) {
      //   console.log(prop);
      // }
    });

    inject((_ApplicationSvc_, _DataSvc_, _API_PATHS_, _StorageSvc_, 
      _ConstantsSvc_, _$httpBackend_, _$resource_, _$window_, _$timeout_, _$q_) => {
      ApplicationSvc = _ApplicationSvc_;
      DataSvc = _DataSvc_;
      API_PATHS = _API_PATHS_;
      StorageSvc = _StorageSvc_;
      ConstantsSvc = _ConstantsSvc_;
      $httpBackend = _$httpBackend_;
      $resource = _$resource_;
      $window = _$window_;
      $timeout = _$timeout_;
      $q = _$q_;
      $resource = _$resource_;
    });

    createApplicationUrl = fakeAPIUrl + API_PATHS.createApplication;
    getApplicationUrl = fakeAPIUrl + API_PATHS.getApplication + idsObj.appId;

    console.log('API_PATHS');
    console.log(API_PATHS);
    //this is a truncated portion of the create URL turned into a regex
    fakeCreateUrl = new RegExp(fakeAPIUrl + API_PATHS.createApplication);

    //swap out to remove dependency on DataSvc?
    // mockDataSvc.application.get = function(appId) {
    //   var deferred = $q.defer();
    //   $timeout(() => {
    //     deferred.resolve(appObj);
    //   }, 0);
    //   return deferred.promise;
    // };

    // mockDataSvc.application.create = function(quoteId) {
    //   var deferred = $q.defer();
    //   $timeout(() => {
    //     deferred.resolve(appObj);
    //   }, 0);
    //   return deferred.promise;
    // };

    $window.localStorage = localStorage; //use fake local and session storage - is testable
    $window.sessionStorage = sessionStorage;

  });

  describe('ApplicationSvc: ', () => {

    describe('Creates a new application: ', () => {
      beforeEach(() => { 
        $httpBackend.when('GET', /.*\/application\/get\/quote_id\/.*/)
          .respond(() => [200, [appObj]]);
      });
      afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
      it('Should call the Data Service using a quote ID to request a new application', () => {
        $httpBackend.expect('GET', /.*\/application\/get\/quote_id\/.*/); //rely on backend definition to respond with the fake appObj
        // ApplicationSvc.getInitialApplication(idObj).then(() => {
        //   expect(true).to.be.true;
        //   //what to test here - that sessionStorage has the appObj?
        // });
        DataSvc.application.create(idObj).then(() => {
          expect(true).to.be.true;
        });
        $httpBackend.flush();
        //expect(getObjVal).to.deep.equal(specObjVal); //something written before - keeping around for syntax idea
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
