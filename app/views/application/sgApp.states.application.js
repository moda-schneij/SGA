'use strict';

const groupsize = {
  url: '/groupsize',
  parent: 'application',
  name: 'groupsize',
  //component: 'groupSizeFormComponent',
  template: '<group-size-form-component app-data="$ctrl.appData"></group-size-form-component>',
  data: {
    order: 1,
    requiresAuth: true,
    title: 'Group size determination',
    linkTitle: 'Group size determination',
    addToMenu: true
  }
};

const planselect = {
  url: '/planselect',
  parent: 'application',
  name: 'planselect',
  //component: 'planSelectFormComponent',
  template: '<plan-select-form-component app-data="$ctrl.appData"></plan-select-form-component>',
  data: {
    order: 2,
    requiresAuth: true,
    title: 'Types of coverage',
    linkTitle: 'Types of coverage',
    addToMenu: true
  }
};

const groupinfo = {
  url: '/groupinfo',
  parent: 'application',
  name: 'groupinfo',
  //component: 'groupInfoFormComponent',
  template: '<group-info-form-component app-data="$ctrl.appData"></group-info-form-component>',
  data: {
    order: 3,
    requiresAuth: true,
    title: 'Group information',
    linkTitle: 'Group information',
    addToMenu: true
  }
};

const cobra = {
  url: '/cobra',
  parent: 'application',
  name: 'cobra',
  //component: 'cobraFormComponent',
  template: '<cobra-form-component app-data="$ctrl.appData"></cobra-form-component>',
  data: {
    order: 4,
    requiresAuth: true,
    title: 'COBRA and OR continuation',
    linkTitle: 'COBRA and OR continuation',
    addToMenu: true
  }
};

const agent_sales = {
  url: '/agent_sales',
  parent: 'application',
  name: 'agent_sales',
  //component: 'agentSalesFormComponent',
  template: '<agent-sales-form-component app-data="$ctrl.appData"></agent-sales-form-component>',
  data: {
    order: 5,
    requiresAuth: true,
    title: 'Payment and sales information',
    linkTitle: 'Payment and sales information',
    addToMenu: true,
    submitView: true
  }
};

const applicationRoutes = [groupsize, planselect, groupinfo, cobra, agent_sales];

export default applicationRoutes;