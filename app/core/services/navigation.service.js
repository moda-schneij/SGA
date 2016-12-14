'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:navigation
 * @description
 * # Navigation
 * Service of the Small Group Application app
 */

import angular from 'angular';

export default class NavigationSvc {

  /*@ngInject*/
  constructor($state, $log, SGA_CLIENT_KEYS, ApplicationSvc) {
    this.$state = $state;
    this.appRouteEntries = $state.get().filter((state) =>
      state.parent && state.parent === 'ApplicationView');
    this.$log = $log;
    this.PROGRESS_KEY = SGA_CLIENT_KEYS.progress;
    this.ApplicationSvc = ApplicationSvc;
    this.getNextStep = this.getNextStep.bind(this);
    this.returnToLastStep = this.returnToLastStep.bind(this);
  }

  //retrive the name of the next step to continue with
  getNextStep() {
    const {ApplicationSvc, appRouteEntries, PROGRESS_KEY} = this;
    const appData = ApplicationSvc.getApplication();
    if (!appData) {
      return null;
    }
    const dummyState = {data: {order: -1}};
    const finalAppRoute = appRouteEntries.reduce((prevVal, currVal) => {
      if (prevVal.data && prevVal.data.order && currVal.data && currVal.data.order) {
        return (currVal.data.order > prevVal.data.order) ? currVal : prevVal;
      }
      return dummyState;
    }, dummyState);
    const finalAppRouteName = finalAppRoute && finalAppRoute.name ? finalAppRoute.name : null;
    const sgaClientVal = appData.sgaClient ? angular.fromJson(appData.sgaClient) : {};
    const nextInProgressRouteName = PROGRESS_KEY ? sgaClientVal[PROGRESS_KEY] : null;
    //if this is an in-progress app, go back to last completed or saved step, otherwise to the end of the application form
    return appData.appStatus === 'P' ? (nextInProgressRouteName ? nextInProgressRouteName : appRouteEntries[0].name) :
      (angular.isString(finalAppRouteName) ? finalAppRouteName : null); //should be a route name as a string or undefined
  }

  returnToLastStep() {
    const {$state} = this;
    const routeName = this.getNextStep()
    $state.go(routeName);
  }

} // end class NavigationSvc declaration
