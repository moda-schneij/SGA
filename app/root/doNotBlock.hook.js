/**
 * This file contains a Transition Hook which protects a
 * route that requires authentication.
 *
 * This hook redirects to /login when both:
 * - The user is not authenticated
 * - The user is navigating to a state that requires authentication
 */
export default function doNotBlockHook($transitions, $log) {
  'ngInject';
  const boundCtrl = this;

  const resolveNowCriteria = {
    to: (state) => {
      return state.data && state.data.doNotBlock && state.data.doNotBlock === true;
    }
  };

  const resolver = (transition) => { 
    $log.debug('this', this);
    $log.debug('boundCtrl', boundCtrl);
    $log.debug('transition: ', transition);
  };

  $transitions.onStart(resolveNowCriteria, resolver, {priority: 10});
}