'use strict';

/**
 * @ngdoc overview
 * @name rootStates
 * @description
 * Root states of the Small Group Application app.
 */

/**
 * This is the parent state for the entire application.
 *
 * This state's primary purposes are:
 * 1) Shows the outermost chrome (including the navigation and logout for authenticated users)
 * 2) Provide a viewport (ui-view) for a substate to plug into
 **/
//foo
// const rootState = {
//   name: 'Root',
//   component: 'sgaRoot',
//   // redirectTo: (trans) => {
//   //   const $q = trans.injector().get('$q');
//   //   const footerContent = getFooterContent();
//   //   const nextRoute = rootRedirect(trans);
//   //   return $q.when(footerContent, () => nextRoute);
//   // },
//   redirectTo: (trans) => {
//     return rootRedirect(trans);
//   },
//   resolve: {
//     footerContent: getFooterContent
//   }
//   // ,
//   // resolve: {
//   //   footerContent: getFooterContent
//   //   // ,returnTo: ($transition$) => {
//   //   //   const $state = $transition$.router.stateService;
//   //   //   const nextStateName = rootRedirect($transition$);
//   //   //   $state.go(nextStateName);
//   //   //   return nextStateName;
//   //   // }
//   // }
// };

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
    overrideDefaultTitle: true
  }
};

const notFoundState = {
  name: 'NotFoundView',
  parent: 'Root',
  url: '/oops',
  template: '<p>Sorry, but you\'ve reached an invalid page. <a ui-sref="home">Return home</a>.</p>',
  data: {
    title: 'Oops!',
    addToMenu: false,
    overrideDefaultTitle: true
  }
};

const rootState = {
  name: 'Root',
  // abstract: true,
  // parent: 'LoggedIn',
  component: 'sgaRoot',
  url: '',
  redirectTo: (trans) => {
    const redirectState = rootRedirect(trans);
    return redirectState;
  },
  resolve: {
    appData: (ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
      'ngInject';
      if (!UserSvc.getIsLoggedIn()) {
        return;
      }
      const savedAppData = ApplicationSvc.getApplication();
      if (savedAppData) {
        return savedAppData;
      } else {
        const idObj = {};
        const existingAppId = ApplicationSvc.getAppID();
        idObj.appId = existingAppId ? existingAppId :
          ($stateParams.id ? $stateParams.id : null);
        idObj.quoteId = $stateParams.quote_id || null;
        idObj.ein = $stateParams.ein || null;
        return ApplicationSvc.getInitialApplication(idObj);
      }
    },
    rules: (RulesSvc, UserSvc) => {
      'ngInject';
      if (!UserSvc.getIsLoggedIn()) {
        return;
      }
      return RulesSvc.rulesAsync;
    },
    options: (OptionsSvc, UserSvc) => {
      'ngInject'
      if (!UserSvc.getIsLoggedIn()) {
        return;
      }
      return OptionsSvc.optionsAsync;
    },
    statesArray: (CachingSvc, UserSvc) => {
      'ngInject';
      if (!UserSvc.getIsLoggedIn()) {
        return;
      }
      return CachingSvc.getStates();
    },
    footerContent: getFooterContent
  }
};

const applicationState = {
  name: 'ApplicationView',
  //abstract: true,
  parent: 'Root',
  url: '/application',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray],
  },
  redirectTo: (trans) => {
    return rootRedirect(trans);
  },
  //??? go back to having the applicationComponent manage application pagination state?
  component: 'applicationComponent',
  // template: `<application-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options"
  // states-array="$ctrl.statesArray" quote-id="$ctrl.quoteId" app-id="$ctrl.appId" group-o-r="$ctrl.groupOR" group-a-k="$ctrl.groupAK">
  // </application-component>`,
  data: {
    requiresAuth: true,
    title: 'Welcome to the small group application form',
    linkTitle: 'Home',
    addToMenu: true
  }
};

//TODO - revisit this
const logoutState = {
  name: 'Logout',
  parent: 'Root',
  redirectTo: 'NotFoundView'
};

function rootRedirect(trans) {
  const NavigationSvc = trans.injector().get('NavigationSvc');
  const ApplicationSvc = trans.injector().get('ApplicationSvc');
  const hasApplication = ApplicationSvc.getApplication();
  const standalone = !(__SER_CONTEXT__);
  const returnTo = hasApplication ? NavigationSvc.returnToLastStep() : (standalone ? 'LoginView' : 'Logout');
  return returnTo;
}

function getFooterContent($sce, StorageSvc, ContentSvc, STORAGE_KEYS) {
  'ngInject';
  // const $sce = trans.injector().get('$sce');
  // const StorageSvc = trans.injector().get('StorageSvc');
  // const ContentSvc = trans.injector().get('ContentSvc');
  // const STORAGE_KEYS = trans.injector().get('STORAGE_KEYS');
  if (!StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY)) {
    StorageSvc.setSessionStore(STORAGE_KEYS.CONTENT_KEY, {}); //set to an empty object if there is no key set here
  }
  const storedFooterContent = StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer; //check for existing content
  if (storedFooterContent) {
    return $sce.trustAsHtml(storedFooterContent);
  } else {
    ContentSvc.getFooterContent().then((response) => {
      if (response.footerContent) {
        return $sce.trustAsHtml(response.footerContent);
      }
    });
  }
}

function getInitialData() {
  debugger;
  const returnObj = {
    footerContent: getFooterContent
  };
  if (UserSvc.getIsLoggedIn()) {
    returnObj.appData = (ApplicationSvc, $stateParams) => {
      'ngInject';
      const savedAppData = ApplicationSvc.getApplication();
      if (savedAppData) {
        return savedAppData;
      } else {
        const idObj = {};
        const existingAppId = ApplicationSvc.getAppID();
        idObj.appId = existingAppId ? existingAppId :
          ($stateParams.id ? $stateParams.id : null);
        idObj.quoteId = $stateParams.quote_id || null;
        idObj.ein = $stateParams.ein || null;
        return ApplicationSvc.getInitialApplication(idObj);
      }
    };
    returnObj.rules = (RulesSvc) => {
      'ngInject';
      return RulesSvc.rulesAsync;
    };
    returnObj.options = (OptionsSvc) => {
      'ngInject';
      return OptionsSvc.optionsAsync;
    };
    returnObj.statesArray = (CachingSvc) => {
      'ngInject';
      return CachingSvc.getStates();
    };
  }
  return returnObj;
}

const rootStates = [rootState, loginState, logoutState, notFoundState, applicationState];

export default rootStates;
