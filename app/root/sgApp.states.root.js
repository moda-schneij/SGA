'use strict';

/**
 * @ngdoc overview
 * @name rootStates
 * @description
 * Root states of the Small Group Application app.
 */

const SER_CONTEXT = __SER_CONTEXT__;
const PROD = __PROD__ ;

/**
 * This is the parent state for the entire application.
 *
 * This state's primary purposes are:
 * 1) Shows the outermost chrome (including the navigation and logout for authenticated users)
 * 2) Provide a viewport (ui-view) for a substate to plug into
**/

const rootState = {
  name: 'Root',
  component: 'sgaRoot',
  redirectTo: !(__SER_CONTEXT__) ? 'LoginView' : '',
  url: ''
};

const authState = {
  name: 'LoggedIn',
  component: 'sgaRoot',
  resolve: {
    appData: ($transition$, ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
      'ngInject';
      const idObj = {};
      const savedAppData = ApplicationSvc.getApplication();
      if ($stateParams.id) { idObj.appId = $stateParams.id };
      if ($stateParams.quote_id) { idObj.quoteId = $stateParams.quote_id };
      if ($stateParams.ein) { idObj.ein = $stateParams.ein };
      return UserSvc.getIsLoggedIn() ? (savedAppData ? savedAppData : ApplicationSvc.getInitialApplication(idObj)) : null;
    },
    rules: ($transition$, RulesSvc, UserSvc) => {
      'ngInject';
      return UserSvc.getIsLoggedIn() ? RulesSvc.rulesAsync : null;
    },
    options: ($transition$, OptionsSvc, UserSvc) => {
      'ngInject'
      return UserSvc.getIsLoggedIn() ? OptionsSvc.optionsAsync : null;
    },
    statesArray: ($transition$, CachingSvc, UserSvc) => {
      'ngInject';
      return UserSvc.getIsLoggedIn() ? CachingSvc.getStates() : null;
    }
  },
  data: {
    requiresAuth: true
  }
};

const loginState = {
  name: 'LoginView',
  parent: 'Root',
  url: '/login',
  //component: 'loginComponent',
  template: '<login-component></login-component>',
  data: {
    requiresAuth: false,
    title: 'Login',
    linkTitle: 'Home',
    addToMenu: false,
    doNotBlock: true,
    overrideDefaultTitle: true
  }
};

const notFoundState = {
  name: 'NotFoundView',
  parent: 'Root',
  url: '/oops',
  template: '<p>Sorry, but you\'ve reached an invalid page. <a ui-sref=\'home\'>Return home</a>.</p>',
  data: {
    title: 'Oops!',
    addToMenu: false,
    doNotBlock: true,
    overrideDefaultTitle: true
  }
};

const applicationState = {
  name: 'ApplicationView',
  parent: 'LoggedIn',
  url: '/application',
  //component: 'applicationComponent',
  template: `<application-component app-data="$ctrl.appData" quote-id="$ctrl.quoteId" app-id="$ctrl.appId" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray">
    </application-component>`,
  data: {
    requiresAuth: true,
    title: 'Welcome to the small group application form',
    linkTitle: 'Home',
    addToMenu: true
  }
  // , resolve: {
  //   appData: (appData) => {
  //     return appData;
  //   },
  //   rules: (rules) => {
  //     return rules;
  //   },
  //   options: (options) => {
  //     return options;
  //   },
  //   statesArray: (statesArray) => {
  //     return statesArray;
  //   },
  //   appId: (appData) => {
  //     return appData.appId;
  //   },
  //   quoteId: (appData) => {
  //     return appData.quoteId;
  //   }
  // }
};

const rootStates = [rootState, loginState, authState, notFoundState, applicationState];

export default rootStates;