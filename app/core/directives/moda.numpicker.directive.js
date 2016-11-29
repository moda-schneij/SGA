'use strict';

/**
 * @ngdoc overview
 * @name modaNumPicker
 * @description
 * Moda number picker directive of the Small Group Application app.
 */

import angular from 'angular';

const template = `
  <div class="input-group">
    <span class="input-group-addon input-group-addon-left numpicker-button numpicker-decrement" type="down" ng-disabled="!canDown">
      <span class="numpicker-button-text">-</span>
    </span>
    <label class="form-control numpicker-number">
      <input name="' + tAttrs.name + '" ng-model="' + tAttrs.value + '" class="numpicker-value">
        <span class="picker-unit-left" ng-if="unitPosition === \'left\' && unit">{{ unit }}</span>{{ value }}
        <span class="picker-unit-right" ng-if="unitPosition !== \'left\' && unit">{{ unit }}</span>
      </input>
    </label>
    <span class="input-group-addon input-group-addon-right numpicker-button numpicker-increment" type="up" ng-disabled="!canUp">
      <span class="numpicker-button-text">+</span>
    </span>
  </div>`;

class ModaNumPickerDirective {
  constructor(hNumberDirective) {
    const newDirective = angular.extend({}, hNumberDirective[0]);
    this.template = template;
  }
  static directiveFactory(hNumberDirective) {
    'ngInject';
    return new ModaNumPickerDirective(hNumberDirective);
  }
}

export default ModaNumPickerDirective.directiveFactory;