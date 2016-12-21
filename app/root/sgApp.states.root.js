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

const rootState = getRootState();

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

const rootLoggedInState = getRootState({type:'loggedIn'});

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

function getRootState(params) {
  const getLoggedIn = params && params.type && params.type === 'loggedIn';
  const loggedOutRoot = {
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
      .then(() => {
        const UrlSvc = trans.injector().get('UrlSvc');
        return rootRedirect(trans, { appId: UrlSvc.getAppIdFromUrl() });
      })
  };
  const loggedInRoot = {
    name: 'RootLoggedIn',
    component: 'sgaRoot',
    // url: '',
    // redirectTo: (trans) => {
    //   const dI = trans.injector();
    //   const NavigationSvc = dI.get('NavigationSvc');
    //   const ApplicationSvc = dI.get('ApplicationSvc');
    //   const $interval = dI.get('$interval');
    //   const $q = dI.get('$q');
    //   return $q(resolveRedirect);
    //   function resolveRedirect(resolve) {
    //     dI.getAsync('appData').then(() => {
    //       let i = 0;
    //       const checkApp = $interval(() => {
    //         if (i === 200) {
    //           $interval.cancel(checkApp);
    //           resolve('Logout');
    //         }
    //         if (ApplicationSvc.getApplication()) {
    //           $interval.cancel(checkApp);
    //           resolve(NavigationSvc.getNextStep());
    //         }
    //         i += 1;
    //       }, 100);
    //     });
    //   }
    // },
    redirectTo: (trans) => {
      const dI = trans.injector();
      const NavigationSvc = dI.get('NavigationSvc');
      return dI.getAsync('appData').then(() => NavigationSvc.getNextStep());
    },
    resolve: {
      //redirectTo: ($transition$) => rootRedirect($transition$),
      login: (DataSvc, UserSvc, UtilsSvc, $log) => {
        'ngInject';
        DataSvc.ping((response) => {
          if (UtilsSvc.isResponseSuccess(response)) {
            UserSvc.setIsLoggedIn();
            return response;
          } else {
            errorHandler(response);
          }
        }, errorHandler);
        function errorHandler(error) {
          $log.error('Error issuing ping during rootLoggedIn resolve');
          return;
        }
      },
      statesArray: (login, CachingSvc) => {
        'ngInject';
        angular.noop(login);
        return CachingSvc.getStates();
      },
      appData: (statesArray, footerContent, ApplicationSvc, StorageSvc, UserSvc, UrlSvc) => {
        'ngInject';
        angular.noop(statesArray, footerContent); //hacky way of requiring but doing nothing with other resolves
        const savedAppData = ApplicationSvc.getApplication();
        if (savedAppData) {
          return savedAppData;
        } else {
          const idObj = {};
          const searchEin = UrlSvc.getEINFromUrl() || null;
          const searchAppId = UrlSvc.getAppIdFromUrl() || null;
          const searchQuoteId = UrlSvc.getQuoteIdFromUrl() || null;
          //const targetStateParams = $transition$.targetState().params();
          const existingAppId = ApplicationSvc.getAppID();
          idObj.appId = existingAppId ? existingAppId :
            (searchAppId ? searchAppId : null);
          idObj.quoteId = searchQuoteId;
          idObj.ein = searchEin;
          return ApplicationSvc.getInitialApplication(idObj);
        }
      },
      rules: (RulesSvc, appData) => {
        'ngInject';
        angular.noop(appData); //hacky way of requiring but doing nothing with other resolves
        return RulesSvc.rulesAsync; //class getter, no invocation
      },
      options: (OptionsSvc, appData) => {
        'ngInject';
        angular.noop(appData); //hacky way of requiring but doing nothing with other resolves
        return OptionsSvc.optionsAsync; //class getter, no invocation
      },
      footerContent: (ContentSvc) => {
        'ngInject';
        return ContentSvc.getFooterContent();
      }
    },
    resolvePolicy: {
      when: 'EAGER'
    },
    data: {
      requiresAuth: true
    }
  };
  if (__SER_CONTEXT__) {
    const loggedInRootClone = Object.assign({}, loggedInRoot);
    const loggedOutRootClone = Object.assign({}, loggedOutRoot);
    loggedInRootClone.url = '/*params'; //update the matcher for loggedInRoot for SER
    delete loggedInRootClone.data.requiresAuth; //allow this state to proceed without initial auth
    delete loggedOutRootClone.url; //remove url matcher and redirect for loggedOutRoot for SER
    delete loggedOutRootClone.redirectTo;
    return getLoggedIn ? loggedInRootClone : loggedOutRootClone;
  } else {
    return getLoggedIn ? loggedInRoot : loggedOutRoot;
  }
}

//http://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
// return angular.fromJSON('{"' + decodeURI(string.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')

// function searchToObj(searchString) {
//   let searchObj = {};
//   if (angular.isString(searchString)) {
//     const string = searchString.charAt(0) === '?' ? searchString.substring(1) : searchString;
//     if (angular.isString(string) && string !== '') {
//       //http://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
//       // return angular.fromJSON('{"' + decodeURI(string.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
//       const searchArr = string.split('&');
//       if (angular.isArray(searchArr) && angular.isString(searchArr[0]) && searchArr[0].indexOf('=') > 0) {
//         searchObj = searchArr.reduce((prev, curr) => {
//           const pair = curr.split('=');
//           prev[pair[0]] = pair[1];
//           return prev;
//         }, {});
//       }
//     }
//   }
//   return searchObj;
// }

function rootRedirect(trans, params) {
  const dI = trans.injector();
  const NavigationSvc = dI.get('NavigationSvc');
  const ApplicationSvc = dI.get('ApplicationSvc');
  const UserSvc = dI.get('UserSvc');
  const isLoggedIn = UserSvc.getIsLoggedIn();
  const hasApplication = ApplicationSvc.getApplication();
  const standalone = !(__SER_CONTEXT__);
  const loggedInRedirectObj = {
    state: 'RootLoggedIn',
    params
  }; //TODO - add logic to deal with bad state in SER context
  //debugger;
  const returnState = standalone ? 'LoginView' : loggedInRedirectObj;
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
