/* eslint angular/module-setter: "warn" */
'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * Constants module of the Small Group Application app.
 */

/*eslint-disable*/
var MODA = window.MODA || {};
/*eslint-enable*/
MODA.SGA = MODA.SGA || {};

import angular from 'angular';

const sgaConstants = (function(){
  //reusable constant parts here
  const serAppName = 'SpeedERatesWeb';
  const apiPath = '/' + serAppName + '/sgaws/rest';
  return {
    'SER_APPNAME': serAppName,
    'SGA_PATH': '/WebContent/sga',
    'API_ROOT_PATH': apiPath,
    'SER_LOGIN_PATH': '/' + serAppName + '/faces/pages/login.xhtml',
    'API_URL': (function () { //figure out where the client is and either return the current fqdn and pathname or default to STG2 or ST2
      var prodApiUrl = '//' + global.window.location.hostname + ':9080' + apiPath;
      return prodApiUrl;
    }()),
    'RS_WS_CONTENT_PATH': '/RiskShareReportProviderWS/rest/content',
    'DCT_URL': 'https://www.modahealth.com/RiskShareReportProviderWS/rest/content',
    'API_PATHS': {
      checkinApplication: '/application/checkIn/id/',
      createApplication: '/application/get/quote_id/',
      getApplication: '/application/get/id/',
      saveApplication: '/application/persist/action/SP',
      submitApplication: '/application/persist/action/SC',
      enrollApplication: '/application/persist/action/SS',
      manualApplication: '/application/persist/action/SM',
      deleteApplication: '/application/persist/action/SD',
      getAppList: '/application/list',
      getStates: '/states',
      getEligibilityPeriods: '/elig_periods',
      getReps: '/representatives',
      getNAICSCodes: '/naic/get/code',
      getPDF: '/application/download',
      ping: '/ping'
    },
    'STG3_URL': 'https://www.stg3.modahealth.com', 
    'MESSAGE_TYPES': ['errors', 'messages', 'alerts'],
    'STORAGE_KEYS': {
      TOKEN_KEY: 'sga-auth-token',
      APPLICATION_KEY: 'sga-application-obj',
      APPID_KEY: 'sga-appid',
      QUOTEID_KEY: 'sga-quoteid',
      EIN_KEY: 'sga-ein',
      LOGGED_IN_KEY: 'sga-is-loggedin',
      CONTENT_KEY: 'sga-content',
      STATE_KEY: 'sga-states',
      OPTIONS_KEY: 'sga-options',
      RULES_KEY: 'sga-rules',
      SIDEBAR_KEY: 'sga-sidebar',
      NAICS_KEY: 'sga-naics'
    },
    'SGA_CLIENT_KEYS': {
      progress: 'starting-route',
      medPlans: 'med-plans' //option to keep medical plans in order, mapping this key to an array of plan names
    },
    'REGEXS': {
      vision: /vis/i,
      medical: /med/i,
      dental: /den/i,
      hearing: /he/i,
      orthodontia: /orth/i,
      directOption: /wdg/i,
      planRate: /e[a-z]{1}rate/i,
      planCount: /e[a-z]{1}plancount/i,
      employee: /ee/i,
      empRate: /ee(plan)?rate/i,
      empCount: /ee(plan)?count/i
    },
    'DIALOGS': {
      manualProcess: {
        heading: 'Set application to manual process?',
        text: `<p>You have selected the option to set this application for "Manual process." Would you like to 
        proceed?</p>`
      }
    },
    'CONFIGS': {
      spinner: {
        lines: 11,
        length: 15,
        width: 8,
        radius: 18,
        rotate: 37,
        trail: 66,
        speed: 0.8,
        position: 'fixed'
      },
      dialogDefaults: {
        className: 'ngdialog-theme-default',
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      }
    },
    'FAKE_APPID': '245',
    'FAKE_QUOTEID': '90038',
    'APP_ROOT': MODA.SGA.appRoot,
    'SER_CONTEXT': !MODA.SGA.devMode,
    'REFERRER_COOKIE': MODA.SGA.refCookieName,
    'TIMEOUT_MINS': 30
  };
}());

export default sgaConstants;
