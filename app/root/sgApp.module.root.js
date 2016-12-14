'use strict';

/**
 * @ngdoc overview
 * @name rootModule
 * @description
 * Root module of the Small Group Application app.
 */

import angular from 'angular';

import rootStates from './sgApp.states.root';
import applicationStates from '../views/application/sgApp.states.application';

import {sgaRoot} from './sgApp.component.root';
import {applicationComponent} from '../views/application/sgApp.component.application';
import {loginComponent} from '../views/login/sgApp.component.login';
//Imports of subforms for the application
import {groupSizeFormComponent} from '../views/application/groupsize/sgApp.component.groupsize';
import {planSelectFormComponent} from '../views/application/planselect/sgApp.component.planselect';
import {groupInfoFormComponent} from '../views/application/groupinfo/sgApp.component.groupinfo';
import {cobraFormComponent} from '../views/application/cobra/sgApp.component.cobra';
import {agentSalesFormComponent} from '../views/application/agent_sales/sgApp.component.agentsales';

//Imports of services and directives for above components
import RootComponentSvc from './sgApp.service.rootcomponent';
import PlanSelectSvc from '../views/application/planselect/sgApp.service.planselect';
import ApplicationComponentSvc from '../views/application/sgApp.service.applicationcomponent';
import CobraComponentSvc from '../views/application/cobra/sgApp.service.cobracomponent';
import GroupsizeComponentSvc from '../views/application/groupsize/sgApp.service.groupsizecomponent';
import GroupinfoComponentSvc from '../views/application/groupinfo/sgApp.service.groupinfocomponent';
//directive
import medEnrollmentValidatorDirectiveFn from '../views/application/planselect/sgApp.directive.medenrollmentvalidator';

const rootComponents = {sgaRoot, applicationComponent, loginComponent, groupSizeFormComponent, planSelectFormComponent, groupInfoFormComponent, cobraFormComponent, agentSalesFormComponent};

//eslint-disable-next-line no-array-constructor
const rootSvcs = new Array(RootComponentSvc, PlanSelectSvc, ApplicationComponentSvc, CobraComponentSvc, GroupsizeComponentSvc, GroupinfoComponentSvc);

//eslint-disable-next-line angular/module-setter
const rootModule = angular.module('sgAppRoot', []);

Object.keys(rootComponents).forEach((name) => rootModule.component(name, rootComponents[name]));

rootSvcs.forEach((service) => rootModule.service(service.name, service));

//eslint-disable-next-line angular/module-getter
rootModule
  .directive('medEnrollmentValidator', medEnrollmentValidatorDirectiveFn)
  .config(($stateProvider) => {
    'ngInject';
    rootStates.concat(applicationStates).forEach((state) => $stateProvider.state(state));
  });

export default rootModule;