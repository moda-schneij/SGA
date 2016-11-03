'use strict';

/**
 * @ngdoc overview
 * @name trustedHTMLFilter
 * @description
 * Trusted HTML filter of the Small Group Application app.
 */

import angular from 'angular';

export default angular.module('trustedHTMLFilter', [])
  .filter('html', trustedHTMLFilterFn);

/*@ngInject*/
function trustedHTMLFilterFn($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    }
}