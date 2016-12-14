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
const rootState = {
  name: 'Root',
  //url: '',
  //abstract: true, //can't redirect from abstract ... with a url?
  component: 'sgaRoot',
  // redirectTo: (trans) => {
  //   const $q = trans.injector().get('$q');
  //   const footerContent = getFooterContent(trans);
  //   const nextRoute = rootRedirect(trans);
  //   return $q.when(footerContent, () => nextRoute);
  // },
  redirectTo: (trans) => {
    debugger;
    rootRedirect(trans)
  },
  resolve: {
    footerContent: getFooterContent
  }
};

// const authState = {
//   name: 'LoggedIn',
//   abstract: true,
//   resolve: {
//     authResolve: getInitialData
//   },
//   data: {
//     requiresAuth: true
//   }
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

const rootLoggedInState = {
  name: 'RootLoggedIn',
  // abstract: true,
  // parent: 'LoggedIn',
  component: 'sgaRoot',
  url: '',
  redirectTo: 'ApplicationView',
  resolve: {
    appData: (ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
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
    },
    rules: (RulesSvc) => {
      'ngInject';
      return RulesSvc.rulesAsync;
    },
    options: (OptionsSvc) => {
      'ngInject'
      return OptionsSvc.optionsAsync;
    },
    statesArray: (CachingSvc) => {
      'ngInject';
      return CachingSvc.getStates();
    },
    footerContent: getFooterContent
  },
  data: {
    requiresAuth: true
  }
};

const applicationState = {
  name: 'ApplicationView',
  //abstract: true,
  parent: 'RootLoggedIn',
  url: '/application',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray],
  },
  // redirectTo: (trans) => {
  //   return rootRedirect(trans);
  // },
  //??? go back to having the applicationComponent manage application pagination state?
  //component: 'applicationComponent',
  template: `<application-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options"
  states-array="$ctrl.statesArray" quote-id="$ctrl.quoteId" app-id="$ctrl.appId" group-o-r="$ctrl.groupOR" group-a-k="$ctrl.groupAK">
  </application-component>`,
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
  const UserSvc = trans.injector().get('UserSvc');
  const NavigationSvc = trans.injector().get('NavigationSvc');
  const isLoggedIn = UserSvc.getIsLoggedIn();
  const nextRoute = NavigationSvc.returnToLastStep();
  const standalone = !(__SER_CONTEXT__);
  return isLoggedIn ? nextRoute : (standalone ? 'LoginView' : 'Logout');
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
  const returnObj = {
    appData: (ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
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
    },
    rules: (RulesSvc) => {
      'ngInject';
      return RulesSvc.rulesAsync;
    },
    options: (OptionsSvc) => {
      'ngInject'
      return OptionsSvc.optionsAsync;
    },
    statesArray: (CachingSvc) => {
      'ngInject';
      return CachingSvc.getStates();
    },
    footerContent: getFooterContent
  };
  return returnObj;
}

const rootStates = [rootState, loginState, logoutState, rootLoggedInState, notFoundState, applicationState];

export default rootStates;
