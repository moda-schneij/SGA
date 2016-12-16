'use strict';

const groupsize = {
  url: '/groupsize',
  parent: 'ApplicationView',
  name: 'GroupSize',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray]
  },
  component: 'groupSizeFormComponent',
  // template: '<group-size-form-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray"></group-size-form-component>',
  data: {
    order: 1,
    requiresAuth: true,
    title: 'Group size determination',
    linkTitle: 'Group size determination',
    addToMenu: true
  }
  // ,
  // resolve: {
  //   statesArray: (statesArray) => statesArray
  // }
};

const planselect = {
  url: '/planselect',
  parent: 'ApplicationView',
  name: 'PlanSelect',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray]
  },
  component: 'planSelectFormComponent',
  // template: '<plan-select-form-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options"  states-array="$ctrl.statesArray"></plan-select-form-component>',
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
  parent: 'ApplicationView',
  name: 'GroupInfo',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray]
  },
  component: 'groupInfoFormComponent',
  // template: `<group-info-form-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options"  states-array="$ctrl.statesArray" quote-id="$ctrl.quoteId"></group-info-form-component>`,
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
  parent: 'ApplicationView',
  name: 'Cobra',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray]
  },
  component: 'cobraFormComponent',
  // template: '<cobra-form-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray"></cobra-form-component>',
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
  parent: 'ApplicationView',
  name: 'AgentSales',
  resolve: {
    appData: ['appData', (appData) => appData],
    rules: ['rules', (rules) => rules],
    options: ['options', (options) => options],
    statesArray: ['statesArray', (statesArray) => statesArray],
    salesRepsArray: (DataSvc, $q) => {
      'ngInject';
      return $q(getReps);
      function getReps(resolve) {
        DataSvc.getReps()
          .then((response) => {
            resolve(response.data.representatives);
          }, (reason) => {
            resolve([]); //fail and return empty array
          })
          .catch((error) => {
            resolve([]);
          });
      }
    }
  },
  component: 'agentSalesFormComponent',
  // template: '<agent-sales-form-component app-data="$ctrl.appData" rules="$ctrl.rules" options="$ctrl.options" states-array="$ctrl.statesArray"></agent-sales-form-component>',
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
