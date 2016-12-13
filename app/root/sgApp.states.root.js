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
  redirectTo: (trans) => {
    const UserSvc = trans.injector().get('UserSvc');
    return rootRedirect(UserSvc);
  },
  url: '',
  resolve: {
    footerContent: getFooterContent
  }
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
  component: 'sgaRoot',
  redirectTo: 'ApplicationView',
  url: '',
  resolve: {
    appData: getInitialData.appData,
    rules: getInitialData.rules,
    options: getInitialData.options,
    statesArray: getInitialData.statesArray,
    footerContent: getInitialData.footerContent
  },
  data: {
    requiresAuth: true
  },
  resolvePolicy: {
    when: 'EAGER'
  }
}

const applicationState = {
  name: 'ApplicationView',
  parent: 'RootLoggedIn',
  url: '/application',
  //component: 'applicationComponent',
  template: `<application-component app-data="$ctrl.appData" quote-id="$ctrl.quoteId" 
    app-id="$ctrl.appId" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray" 
    group-o-r="$ctrl.groupOR" group-a-k="$ctrl.groupAK">
    </application-component>`,
  data: {
    requiresAuth: true,
    title: 'Welcome to the small group application form',
    linkTitle: 'Home',
    addToMenu: true
  },
  resolve: {
    appData: (getInitialData) => getInitialData.appData,
    rules: (getInitialData) => getInitialData.rules,
    options: (getInitialData) => getInitialData.options,
    statesArray: (getInitialData) => getInitialData.statesArray,
    footerContent: (getInitialData) => getInitialData.footerContent
  }
  // ,
  // resolve: {
  //   appData: appData
  // }
};

//TODO - revisit this
const logoutState = {
  name: 'Logout',
  parent: 'Root',
  redirectTo: 'NotFoundView'
}

function rootRedirect(UserSvc) {
  const isLoggedIn = UserSvc.getIsLoggedIn();
  const standalone = !(__SER_CONTEXT__);
  return isLoggedIn ? 'ApplicationView' : (!(__SER_CONTEXT__) ? 'LoginView' : 'Logout');
  //return isLoggedIn ? 'ApplicationView' : 'LoginView';
}

function getFooterContent($sce, StorageSvc, ContentSvc, STORAGE_KEYS) {
  'ngInject';
  if (!StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY)) {
    StorageSvc.setSessionStore(STORAGE_KEYS.CONTENT_KEY, {}); //set to an empty object if there is no key set here
  }
  const checkSavedFooter = StorageSvc.getSessionStore(STORAGE_KEYS.CONTENT_KEY).footer; //check for existing content
  let storedFooterContent = checkSavedFooter ? checkSavedFooter : null;
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
