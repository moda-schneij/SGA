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
  url: '',
  resolve: {
    footerContent: getFooterContent
  }
};

const authState = {
  name: 'LoggedIn',
  data: {
    requiresAuth: true
  }
  // },
  // resolve: {
  //   appData: ($transition$, ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
  //     'ngInject';
  //     const idObj = {};
  //     const savedAppData = ApplicationSvc.getApplication();
  //     if ($stateParams.id) { idObj.appId = $stateParams.id };
  //     if ($stateParams.quote_id) { idObj.quoteId = $stateParams.quote_id };
  //     if ($stateParams.ein) { idObj.ein = $stateParams.ein };
  //     return savedAppData ? savedAppData : ApplicationSvc.getInitialApplication(idObj);
  //     //return UserSvc.getIsLoggedIn() ? (savedAppData ? savedAppData : ApplicationSvc.getInitialApplication(idObj)) : null;
  //   },
  //   rules: ($transition$, RulesSvc, UserSvc) => {
  //     'ngInject';
  //     return RulesSvc.rulesAsync;
  //     //return UserSvc.getIsLoggedIn() ? RulesSvc.rulesAsync : null;
  //   },
  //   options: ($transition$, OptionsSvc, UserSvc) => {
  //     'ngInject'
  //     return OptionsSvc.optionsAsync;
  //     //return UserSvc.getIsLoggedIn() ? OptionsSvc.optionsAsync : null;
  //   },
  //   statesArray: ($transition$, CachingSvc, UserSvc) => {
  //     'ngInject';
  //     return CachingSvc.getStates();
  //     //return UserSvc.getIsLoggedIn() ? CachingSvc.getStates() : null;
  //   }
  // }
};

const loginState = {
  name: 'LoginView',
  parent: 'Root',
  url: '/login',
  //component: 'loginComponent',
  template: '<login-component></login-component>',
  data: {
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

const rootLoggedInState = {
  name: 'RootLoggedIn',
  //parent: 'LoggedIn',
  component: 'sgaRoot',
  redirectTo: 'ApplicationView',
  url: '',
  resolve: {
    appData: ($transition$, ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
      'ngInject';
      const idObj = {};
      const savedAppData = ApplicationSvc.getApplication();
      if ($stateParams.id) { idObj.appId = $stateParams.id };
      if ($stateParams.quote_id) { idObj.quoteId = $stateParams.quote_id };
      if ($stateParams.ein) { idObj.ein = $stateParams.ein };
      return savedAppData ? savedAppData : ApplicationSvc.getInitialApplication(idObj);
      //return UserSvc.getIsLoggedIn() ? (savedAppData ? savedAppData : ApplicationSvc.getInitialApplication(idObj)) : null;
    },
    rules: ($transition$, RulesSvc, UserSvc) => {
      'ngInject';
      return RulesSvc.rulesAsync;
      //return UserSvc.getIsLoggedIn() ? RulesSvc.rulesAsync : null;
    },
    options: ($transition$, OptionsSvc, UserSvc) => {
      'ngInject'
      return OptionsSvc.optionsAsync;
      //return UserSvc.getIsLoggedIn() ? OptionsSvc.optionsAsync : null;
    },
    statesArray: ($transition$, CachingSvc, UserSvc) => {
      'ngInject';
      return CachingSvc.getStates();
      //return UserSvc.getIsLoggedIn() ? CachingSvc.getStates() : null;
    },
    footerContent: getFooterContent
  },
  data: {
    requiresAuth: true
  }
}

const applicationState = {
  name: 'ApplicationView',
  parent: 'RootLoggedIn',
  url: '/application',
  //component: 'applicationComponent',
  template: `<application-component app-data="$ctrl.appData" quote-id="$ctrl.quoteId" app-id="$ctrl.appId" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray" group-o-r="$ctrl.groupOR" group-a-k="$ctrl.groupAK">
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

function getFooterContent($sce, StorageSvc, ContentSvc, STORAGE_KEYS) {
  'ngInject';
  let storedFooterContent = StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer;
  if (!storedFooterContent) {
    ContentSvc.getFooterContent().then((response) => {
      if (response.footerContent) {
        return $sce.trustAsHtml(response.footerContent);
      }
    });
  }
  return $sce.trustAsHtml(storedFooterContent);
}

const rootStates = [rootState, loginState, rootLoggedInState, notFoundState, applicationState];

export default rootStates;