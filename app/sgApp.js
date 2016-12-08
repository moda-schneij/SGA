'use strict';

/**
 * @ngdoc overview
 * @name sgApp
 * @description
 * Main module of the application.
 */

import 'babel-polyfill';
import jquery from 'jquery';
import angular from 'angular';
import sgAppThirdParty from './core/sgApp.third-party';
import sgAppCore from './core/sgApp.core';
import sgAppRoot from './root/sgApp.module.root';
import sgaConfig from './core/sgApp.config';
import authHookRunBlock from './core/requiresAuth.hook';

//Imports of components (partials) defined on the root module, in separate files, which are not core application dependencies
/*I don't like this pattern, but so far I can't figure out another way to structure
so that I can get the parent component using a require in the partial component*/

/*eslint-disable no-unused-vars*/

import sidebar from './partials/sidebar/sgApp.component.sidebar';
import header from './partials/header/sgApp.component.header';
import footer from './partials/footer/sgApp.component.footer';
import messages from './partials/messages/sgApp.component.messages';

//Imports of services for above components
import SidebarSvc from './partials/sidebar/sgApp.service.sidebar';

/*eslint-enable no-unused-vars*/

//require('./vendor/styles/sga_vendor.scss');
require('../node_modules/select2/select2.css');
require('./styles/sga.scss');

/*eslint-disable*/
var MODA = window.MODA || {};
/*eslint-enable*/

export default angular
  .module('sgApp', [
    sgAppThirdParty.name,
    sgAppCore.name,
    sgAppRoot.name
  ])
  .run(authHookRunBlock)
  .config(sgaConfig);

/*@ngInject*/
function runBlock(RouteChangeSvc, $templateCache) {
  RouteChangeSvc.onStart();
  RouteChangeSvc.onSuccess();
}