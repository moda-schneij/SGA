'use strict';

const helpers = require('../../../test.helper');
const module = helpers.module;
const inject = helpers.inject;
const localStorage = helpers.localStorage;
const sessionStorage = helpers.sessionStorage;
const path = require('path');
const fs = require('fs');
const appObj = require('json!./application.payload.json');

require('../sgApp.core');

const expect = require('chai').expect;
const assert = require('chai').assert;

describe('Services: ', function() {

  // load the service's module
  let API_URL, ApplicationSvc, DataSvc, ConstantsSvc, UrlSvc, $httpBackend, $window, $timeout, 
    $q, API_PATHS, createApplicationUrl, getApplicationUrl, mockAuthenticationSvc, mockCookies, 
    mockResource;

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

  beforeEach(function() {
    module('sgAppCore', function ($provide) {
      $provide.value('$cookies', mockCookies);
      $provide.value('$resource', mockResource);
      $provide.value('AuthenticationSvc', mockAuthenticationSvc);
      $provide.value('UrlSvc', mockUrlSvc); //urls always return the app or quote id in the fake payload
      $provide.value('UserSvc', mockUserSvc); //user is always logged in
    });

    inject(function(_ApplicationSvc_, _API_URL_, _API_PATHS_, _StorageSvc_, _ConstantsSvc_, _$httpBackend_, _$window_, _$timeout_, _$q_, _DataSvc_) {
      ApplicationSvc = _ApplicationSvc_;
      API_URL = _API_URL_;
      API_PATHS = _API_PATHS_;
      StorageSvc = _StorageSvc_;
      ConstantsSvc = _ConstantsSvc_;
      $httpBackend = _$httpBackend_;
      $window = _$window_;
      $timeout = _$timeout_;
      $q = _$q_;
      DataSvc = _DataSvc_; //this may lead to problems with unexpected responses
      $window.localStorage = localStorage; //use fake local and session storage - is testable
      $window.sessionStorage = sessionStorage;
    });

    createApplicationUrl = API_URL + API_PATHS.createApplication + idsObj.quoteId;
    getApplicationUrl = API_URL + API_PATHS.getApplication + idsObj.appId;

    //swap out to remove dependency on DataSvc?
    mockDataSvc.application.get = function(appId) {
      var deferred = $q.defer();
      $timeout(() => {
        deferred.resolve(appObj);
      }, 0);
      return deferred.promise;
    };

    mockDataSvc.application.create = function(quoteId) {
      var deferred = $q.defer();
      $timeout(() => {
        deferred.resolve(appObj);
      }, 0);
      return deferred.promise;
    };

    $window.localStorage = localStorage;
    $window.sessionStorage = sessionStorage;

  });

  describe('ApplicationSvc: ', function() {

    describe('Creates a new application: ', () => {
      beforeEach(() => { 
        $httpBackend.when('GET', createApplicationUrl)
          .respond(appObj);
      });
      afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
      it('Should call the Data Service using a quote ID to request a new application', function() {
        $httpBackend.flush();
        $httpBackend.expectGET(createApplicationUrl); //rely on backend definition to respond with the fake appObj
        ApplicationSvc.getInitialApplication().then(() => {
          expect(true).to.be.true;
          //what to test here - that sessionStorage has the appObj?
        });
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
