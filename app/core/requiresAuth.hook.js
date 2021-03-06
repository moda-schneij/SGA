'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.requiresAuthHook
 * @description
 * # requiresAuthHook of the Small Group Application app
 * for transitioning to routes requiring authentication
 */

/**
 * This file contains a Transition Hook which protects a
 * route that requires authentication.
 *
 * This hook redirects to /login when both:
 * - The user is not authenticated
 * - The user is navigating to a state that requires authentication
 */

export default function authHookRunBlock($transitions) {
  'ngInject';
  // Matches if the destination state's data property has a truthy 'requiresAuth' property
  const requiresAuthCriteria = {
    to: (state) => state.data && state.data.requiresAuth
  };

  // Function that returns a redirect for the current transition to the login state
  // if the user is not currently authenticated (according to the AuthService)

  const redirectToLogin = (transition) => {
    const abort = (/^.{0} | 'LoginView'$/).test(transition.from().name);
    const AuthenticationSvc = transition.injector().get('AuthenticationSvc');
    const UserSvc = transition.injector().get('UserSvc');
    const $log = transition.injector().get('$log');
    const $state = transition.router.stateService;
    const isLoggedIn = UserSvc.getIsLoggedIn();
    $log.debug('Inside requiresAuth hook, is logged in?', isLoggedIn);
    if (!isLoggedIn && !abort) {
      if (!__SER_CONTEXT__) {
        // eslint-disable-next-line no-undefined
        return $state.target('LoginView', undefined, { location: true });
        //$state.go('LoginView');
      } else {
        AuthenticationSvc.handleUnauth(); //TODO - figure out best call to make here
      }
    }
  };

  // Register the "requires auth" hook with the TransitionsService
  $transitions.onBefore(requiresAuthCriteria, redirectToLogin, {priority: 10});
}
