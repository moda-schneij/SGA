'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:token
 * @description
 * # Token
 * Service of the Small Group Application app
 */

export default class SpinnerControlSvc{

  /*@ngInject*/
  constructor(usSpinnerService, $injector) {
    this.usSpinnerService = usSpinnerService;
    this.$injector = $injector;
  }

  startSpin(option) {
    const number = option && option.number ? option.number : 1;
    const optionParam = {
      spin: true,
      number: number
    };
    if (option && option.overlay) {
      optionParam.overlay = true;
    }
    controlSpin.call(this, optionParam);
  }

  stopSpin(option) {
    const number = option && option.number ? option.number : 1;
    const optionParam = {
      stop: true,
      number: number
    };
    controlSpin.call(this, optionParam);
  }
}

function controlSpin(option) {
  const number = option.number;
  const ngDialog = this.$injector.get('ngDialog'); //must inject here to avoid a circular dependency
  const spin = option && option.spin;
  const stop = option && option.stop;
  const action = spin ? 'spin' : 'stop';
  const overlay = option && option.overlay;
  const spinnerName = 'spinner-' + number;
  const noOpenDialogs = ngDialog.getOpenDialogs().length === 0;
  this.usSpinnerService[action](spinnerName);
  if (spin && overlay && noOpenDialogs) {
    this.spinnerOverlay = ngDialog.open({
      template: '<span style="display:none"></span>', 
      plain: true, 
      appendClassName: 'ngdialog-overlay-only',
      name: 'overlay'
    });
  } else {
    if (this.spinnerOverlay && this.spinnerOverlay.id) {
      ngDialog.close(this.spinnerOverlay.id);
    } else {
      ngDialog.closeAll();
    }
  }  
}
