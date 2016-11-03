'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:routechange
 * @description
 * # RouteChange
 * Service of the Small Group Application App
 */

import angular from 'angular';
let routeOnStartWatch;
let routeOnSuccess;

export default class RouteChangeSvc {

  /*@ngInject*/
  constructor($location, $log, $rootScope, $rootRouter) {
    this.$location = $location;
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$rootRouter = $rootRouter;
  }

  // this.$rootScope.$on('$destroy', function() {
  //   routeOnStartWatch();
  //   routeOnSuccess();
  // });

  onStart() {
    routeOnStartWatch = this.$rootScope.$watch(() => this.$rootRouter.navigating, 
      (newVal) => {
        var requiresAuth = false;
        if (newVal && this.$rootRouter.currentInstruction) {
          requiresAuth = this.$rootRouter.currentInstruction.component.routeData.data.loginRequired;
          this.$log.debug('ROOTROUTER IS NAVIGATING');
          this.$log.debug(this.$rootRouter);
          this.$log.debug('requiresAuth: ' + requiresAuth);
        }
      });
    this.$rootScope.$on('$destroy', routeOnStartWatch);
  }

  onSuccess() {
    routeOnSuccess = this.$rootScope.$on('$routeChangeSuccess', routeOnSuccessCB.bind(this));
    this.$rootScope.$on('$destroy', () => {
      this.$rootScope.$off('$routeChangeSuccess');
    });
  }

}

function routeOnSuccessCB(e) {
  this.$log.debug(e);
}