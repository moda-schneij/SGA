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

const rootState = {
  name: 'Root',
  url: '',
  component: 'sgaRoot',
  resolve: {
    footerContent: (ContentSvc) => {
      'ngInject';
      return ContentSvc.getFooterContent();
    }
  },
  redirectTo: (trans) => trans.injector()
    .getAsync('footerContent')
    .then(() => ({
        state: rootRedirect(trans),
        params: trans.params()
      })
    )
};

const loginState = {
  name: 'LoginView',
  parent: 'Root',
  url: '/login',
  component: 'loginComponent',
  //template: '<login-component></login-component>',
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
  // url: '',
  redirectTo: (trans) => {
    const dI = trans.injector();
    const NavigationSvc = dI.get('NavigationSvc');
    return dI.getAsync('appData').then(() => NavigationSvc.getNextStep());
  },
  resolve: {
    //redirectTo: ($transition$) => rootRedirect($transition$),
    statesArray: (CachingSvc) => {
      'ngInject';
      return CachingSvc.getStates();
    },
    appData: (statesArray, ApplicationSvc, StorageSvc, UserSvc, STORAGE_KEYS, $stateParams) => {
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
      return RulesSvc.rulesAsync; //class getter, no invocation
    },
    options: (OptionsSvc) => {
      'ngInject'
      return OptionsSvc.optionsAsync; //class getter, no invocation
    },
    footerContent: (ContentSvc) => {
      'ngInject';
      return ContentSvc.getFooterContent();
    }
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
    statesArray: ['statesArray', (statesArray) => statesArray]
  },
  component: 'applicationComponent',
  // template: `<application-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray" quote-id="$ctrl.quoteId" app-id="$ctrl.appId" group-o-r="$ctrl.groupOR" group-a-k="$ctrl.groupAK"> </application-component>`,
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
  const dI = trans.injector();
  const NavigationSvc = dI.get('NavigationSvc');
  const ApplicationSvc = dI.get('ApplicationSvc');
  const UserSvc = dI.get('UserSvc');
  const isLoggedIn = UserSvc.getIsLoggedIn();
  const hasApplication = ApplicationSvc.getApplication();
  const standalone = !(__SER_CONTEXT__);
  const returnState = standalone ? 'LoginView' : 'RootLoggedIn'; //TODO - add logic to deal with bad state in SER context
  debugger;
  if (isLoggedIn) {
    if (hasApplication) {
      return NavigationSvc.returnToLastStep();
    } else {
      return returnState;
    }
  } else {
    return returnState;
  }
}

const rootStates = [rootState, rootLoggedInState, loginState, logoutState, notFoundState, applicationState];

export default rootStates;
