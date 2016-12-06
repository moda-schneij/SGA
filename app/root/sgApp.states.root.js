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
  name: 'root',
  redirectTo: __SER_CONTEXT__ ? 'application' : 'login',
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
    }
  },
  data: {
    requiresAuth: false
  }
};

const loginState = {
  name: 'login',
  parent: 'root',
  url: '/login',
  //component: 'loginComponent',
  template: '<login-component set-route-ready="$ctrl.setRouteReady()"></login-component>',
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
  name: 'notfound',
  parent: 'root',
  url: '/oops',
  //component: 'loginComponent',
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
  name: 'application',
  parent: 'root',
  url: '/application',
  template: '<application app-data="$ctrl.appData" quote-Id="$ctrl.quoteId" app-Id="$ctrl.appId"></application>',
  data: {
    requiresAuth: true,
    title: 'Welcome to the small group application form',
    linkTitle: 'Home',
    addToMenu: true
  }
};

const rootStates = [rootState, loginState, notFoundState, applicationState];

export default rootStates;