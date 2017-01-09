'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.spinnerControlHook
 * @description
 * # spinnerControlHook of the Small Group Application app
 * for transitioning routes with a spinner (start and stop)
 */

/**
 * This file contains a Transition Hook that controls the pinner stopping and starting
 */

export default function spinnerControlHookRunBlock($transitions) {
  'ngInject';
  const spinnerStopCriteria = {}; //no criteria at this point
  const stopSpin = (transition) => {
    const SpinnerControlSvc = transition.injector().get('SpinnerControlSvc');
    SpinnerControlSvc.stopSpin();
  }
  // Register the hook with the TransitionsService
  $transitions.onSuccess(spinnerStopCriteria, stopSpin, {priority: 10});
}
