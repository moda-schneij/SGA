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
import sgAppApplicationForm from './views/application/sgApp.component.application';
import sgAppThirdParty from './core/sgApp.third-party';
import sgAppCore from './core/sgApp.core';
import sgaConfig from './core/sgApp.config';
import authHookRunBlock from './core/requiresAuth.hook';
import sgAppLogin from './views/login/sgApp.component.login';
import sgAppRoot from './root/sgApp.component.root';

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

//Imports of subforms for the application, same reason as above
import groupSizeFormComponent from './views/application/groupsize/sgApp.component.groupsize';
import planSelectFormComponent from './views/application/planselect/sgApp.component.planselect';
import groupInfoFormComponent from './views/application/groupinfo/sgApp.component.groupinfo';
import cobraFormComponent from './views/application/cobra/sgApp.component.cobra';
import agentSalesFormComponent from './views/application/agent_sales/sgApp.component.agentsales';

//Imports of services and directives for above components
import RootComponentSvc from './root/sgApp.service.rootcomponent';
import PlanSelectSvc from './views/application/planselect/sgApp.service.planselect';
import ApplicationComponentSvc from './views/application/sgApp.service.applicationcomponent';
import CobraComponentSvc from './views/application/cobra/sgApp.service.cobracomponent';
import GroupsizeComponentSvc from './views/application/groupsize/sgApp.service.groupsizecomponent';
import GroupinfoComponentSvc from './views/application/groupinfo/sgApp.service.groupinfocomponent';
import medEnrollmentValidator from './views/application/planselect/sgApp.directive.medenrollmentvalidator';

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
    sgAppApplicationForm.name,
    sgAppRoot.name,
    sgAppLogin.name
  ])
  //.value('$routerRootComponent', 'sgaRoot')
  .run(authHookRunBlock)
  .config(sgaConfig);

/*@ngInject*/
function runBlock(RouteChangeSvc, $templateCache) {
  RouteChangeSvc.onStart();
  RouteChangeSvc.onSuccess();
}