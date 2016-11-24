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
 */
export const rootState = {
  name: 'root',
  redirectTo: __SER_CONTEXT__ ? 'application' : 'login',
  component: 'sgaRoot'
};

export const loginState = {
  name: 'login',
  parent: 'root',
  url: '/login',
  component: 'loginComponent'
};

export const applicationState = {
  name: 'application',
  parent: 'root',
  url: '/application',
  component: 'applicationComponent',
  resolve: {
    appData: function(ApplicationSvc, $transition$) {
      const idObj = {};
      const params = $transition$.params();
      return ApplicationSvc.getInitialApplication(idObj);
    }
  }
};