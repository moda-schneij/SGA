'use strict';

const groupsize = {
  path: '/groupsize',
  parent: 'application',
  name: 'GroupSize',
  component: 'groupSizeFormComponent',
  useAsDefault: true,
  data: {
    order: 1,
    requiresAuth: true,
    title: 'Group size determination',
    linkTitle: 'Group size determination',
    addToMenu: true
  }
};

const planselect = {
  path: '/planselect',
  parent: 'application',
  name: 'PlanSelect',
  component: 'planSelectFormComponent',
  data: {
    order: 2,
    requiresAuth: true,
    title: 'Types of coverage',
    linkTitle: 'Types of coverage',
    addToMenu: true
  }
};

const groupinfo = {
  path: '/groupinfo',
  parent: 'application',
  name: 'GroupInfo',
  component: 'groupInfoFormComponent',
  data: {
    order: 3,
    requiresAuth: true,
    title: 'Group information',
    linkTitle: 'Group information',
    addToMenu: true
  }
};

const cobra = {
  path: '/cobra',
  parent: 'application',
  name: 'Cobra',
  component: 'cobraFormComponent',
  data: {
    order: 4,
    requiresAuth: true,
    title: 'COBRA and OR continuation',
    linkTitle: 'COBRA and OR continuation',
    addToMenu: true
  }
};

const agent_sales = {
  path: '/agent_sales',
  parent: 'application',
  name: 'AgentSales',
  component: 'agentSalesFormComponent',
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