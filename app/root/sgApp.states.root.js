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
  template: '<application appdata="$ctrl.appData"></application>',
  resolve: {
    appData: (ApplicationSvc, $transition$) => {
      'ngInject';
      const idObj = {};
      const params = $transition$.params();
      params.id && (idObj.appId = params.id);
      params.quote_id && (idObj.quoteId = params.quote_id);
      params.ein && (idObj.ein = params.ein);
      return ApplicationSvc.getInitialApplication(idObj);
    }
  },
  data: {
    requiresAuth: true,
    title: 'Welcome to the small group application form',
    linkTitle: 'Home',
    addToMenu: true
  }
};

const rootStates = [rootState, loginState, notFoundState, applicationState];

export default rootStates;