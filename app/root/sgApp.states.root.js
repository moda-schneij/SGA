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
  url: '',
  component: 'sgaRoot',
  redirectTo: (trans) => rootRedirect(trans),
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
  // redirectTo: (trans) => {
  //   const redirectState = rootRedirect(trans);
  //   return redirectState;
  // },
  resolve: {
    redirectTo: ($transition$) => rootRedirect($transition$),
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
  const SpinnerControlSvc = dI.get('SpinnerControlSvc');
  const MessagesSvc = dI.get('MessagesSvc');
  const $interval = dI.get('$interval');
  const $q = dI.get('$q');
  const UserSvc = dI.get('UserSvc');
  const isLoggedIn = UserSvc.getIsLoggedIn();
  let hasApplication = ApplicationSvc.getApplication();
  const standalone = !(__SER_CONTEXT__);
  let waitForApp;
  function checkAppStatus(resolve, reject) {
    let ticker = 0;
    function innerFunc() {
      hasApplication = ApplicationSvc.getApplication();
      if (!hasApplication && ticker < ((30 * 1000) / 200)) { //total of 30 seconds
        ++ticker;
        if (angular.isUndefined(waitForApp)) {
          waitForApp = $interval(innerFunc, 200);
        }
      } else {
        if (hasApplication) {
          if (angular.isDefined(waitForApp)) {
            $interval.cancel(waitForApp);
            waitForApp = null;
          }
          const nextRoute = NavigationSvc.getNextStep();
          resolve(nextRoute);
        } else {
          reject('No application returned');
          //TODO - pattern for dealing with no application coming back from the server
          SpinnerControlSvc.stopSpin();
          MessagesSvc.registerErrors('No application returned');
        }
      }
    }
    innerFunc();
  }
  if (isLoggedIn) {
    if (!hasApplication) {
      return $q(checkAppStatus);
    } else {
      return NavigationSvc.returnToLastStep();
    }
  } else {
    return (standalone ? 'LoginView' : 'Logout');
  }
}

function getFooterContent($sce, StorageSvc, ContentSvc, STORAGE_KEYS) {
  'ngInject';
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

const rootStates = [rootState, rootLoggedInState, loginState, logoutState, notFoundState, applicationState];

export default rootStates;
