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
  redirectTo: __SER_CONTEXT__ ? 'ApplicationView' : 'LoginView',
  component: 'sgaRoot',
  url: '',
  resolve: {
    appData: (ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
      'ngInject';
      const idObj = {};
      const savedAppData = ApplicationSvc.getApplication();
      if ($stateParams.id) { idObj.appId = $stateParams.id };
      if ($stateParams.quote_id) { idObj.quoteId = $stateParams.quote_id };
      if ($stateParams.ein) { idObj.ein = $stateParams.ein };
      return UserSvc.getIsLoggedIn() ? (savedAppData ? savedAppData : ApplicationSvc.getInitialApplication(idObj)) : null;
    },
    rules: (RulesSvc, UserSvc) => {
      'ngInject';
      return UserSvc.getIsLoggedIn() ? RulesSvc.rulesAsync : null;
    },
    options: (OptionsSvc, UserSvc) => {
      'ngInject'
      return UserSvc.getIsLoggedIn() ? OptionsSvc.optionsAsync : null;
    },
    statesArray: (CachingSvc, UserSvc) => {
      'ngInject';
      return UserSvc.getIsLoggedIn() ? CachingSvc.getStates() : null;
    }
  },
  data: {
    requiresAuth: false
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
    requiresAuth: false,
    title: 'Oops!',
    addToMenu: false,
    doNotBlock: true,
    overrideDefaultTitle: true
  }
};

const applicationState = {
  name: 'ApplicationView',
  parent: 'Root',
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
  // ,resolve: {
  //   someVal: ($timeout) => {
  //     'ngInject';
  //     $timeout(() => {
  //       debugger;
  //       return 'foo';
  //     }, 2000)
  //   },
  //   appData: (appData) => {
  //     debugger;
  //     return appData;
  //   },
  //   rules: (rules) => {
  //     debugger;
  //     return rules;
  //   },
  //   options: (options) => {
  //     debugger;
  //     return options;
  //   },
  //   statesArray: (statesArray) => {
  //     debugger;
  //     return statesArray;
  //   },
  //   appId: (appData) => {
  //     debugger;
  //     return appData.appId;
  //   },
  //   quoteId: (appData) => {
  //     debugger;
  //     return appData.quoteId;
  //   }
  // }
};

const rootStates = [rootState, loginState, notFoundState, applicationState];

export default rootStates;