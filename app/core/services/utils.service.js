'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:utils
 * @description
 * # Utils (utility)
 * Service of the Small Group Application app
 */

import angular from 'angular';
const _isEmpty = require('lodash/isEmpty');

export default class UtilsSvc {

  /*@ngInject*/
  constructor($log) {
    this.$log = $log;
    this.notNullOrEmpty = this.notNullOrEmpty.bind(this);
    this.notNullOrEmptyObj = this.notNullOrEmptyObj.bind(this);
    this.parseNums = this.parseNums.bind(this);
    this.parseFloats = this.parseFloats.bind(this);
    this.isNumber = this.isNumber.bind(this);
    this.isNumString = this.isNumString.bind(this);
    this.isNumberOrNumString = this.isNumberOrNumString.bind(this);
    this.isStringOrArray = this.isStringOrArray.bind(this);
    this.isArrayOfOneOrMore = this.isArrayOfOneOrMore.bind(this);
    this.safeToString = this.safeToString.bind(this);
    this.getResponse = this.getResponse.bind(this);
  }

  isNonEmptyString(val) {
    return angular.isString(val) && val !== '';
  }

  safeToString(val) {
    return ((val || this.isNumberOrNumString(val)) && angular.isFunction(val.toString)) ? val.toString() : '';
  }

  toFixedTwo(val) {
    const valToParse = this.safeToString(val) !== '' ? this.safeToString(val) : 0;
    return parseFloat(valToParse, 2).toFixed(2);
  }

  //takes a value returns boolean for not null or empty string
  notNullOrEmpty(val) {
    return val ? val !== '' && val !== 'null' : false;
  }

  //takes a value and returns boolean for not null or empty object or empty string
  notNullOrEmptyObj(val) {
    return this.notNullOrEmpty(val) && !_isEmpty(val);
  }

  //flips notNullOrEmptyObj
  isNullOrEmptyObj(val) {
    return !this.notNullOrEmptyObj(val);
  }

  isNullOrEmpty(val) {
    return !this.notNullOrEmpty(val);
  }

  checkAndSetToNull(val) {
    if (!this.notNullOrEmpty(val)) {
      return null;
    }
    return val;
  }

  parseNums(value, opt) {
    const option = opt || {};
    const val = !isNaN(value) && angular.isNumber(value) ? 
      value.toString().replace(/,/g, '') : angular.isString(value) && value !== '' ? 
      value.replace(/,/g, '') : false;
    return val ? (option && option.parseFloat ? parseFloat(val) : parseInt(val, 10)) : 0;
  }

  parseFloats(val) {
    return this.parseNums(val, {parseFloat: true});
  }

  isNumber(val) {
    return !isNaN(val) && angular.isNumber(val);
  }

  isNumString(val) {
    return this.isNumber(this.parseNums(val)) && this.isNumber(this.parseFloats(val));
  }

  isNumberOrNumString(val) {
    return this.isNumber(val) || this.isNumString(val);
  }

  isArrayOfOneOrMore(val) {
    return angular.isArray(val) && val.length > 0;
  }

  isArrayOfUsableIterables(val) {
    const iterable = this.isArrayOfOneOrMore(val);
    let _isArrayOfUsableIterables;
    if (iterable) {
      _isArrayOfUsableIterables = val.filter((item) => this.notNullOrEmptyObj(item)).length === val.length;
    }
    return _isArrayOfUsableIterables ? _isArrayOfUsableIterables : false;
  }

  //totals calculators, used by rate table (and possibly elsewhere)

  calculateTotals(option, arr) {
    return arr.reduce((a, b) => {
      const valOpt = angular.isObject(option) && option.value;
      const aVal = !isNaN(a) && angular.isNumber(a) ? a : 
        valOpt && angular.isObject(a) && a[valOpt.value] && 
        !isNaN(a[valOpt.value]) && angular.isNumber(a[valOpt.value]) ? 
        a[valOpt.value] : 0;
      const bVal = !isNaN(b) && angular.isNumber(b) ? b : 
        valOpt && angular.isObject(b) && b[valOpt.value] && 
        !isNaN(b[valOpt.value]) && angular.isNumber(b[valOpt.value]) ? 
        b[valOpt.value] : 0;
      const arg1 = parseInt(aVal, 10);
      const arg2 = parseInt(bVal, 10);
      return arg1 + arg2;
    });
  }

  subtotaler(option, arr) { //this is a variant on calculateTotals - TODO - verify which is a better solution
    if (arr && angular.isArray(arr)) {
      return arr.reduce((a,b) => {
        const float = option && option.float;
        const arg1 = float ? this.parseFloats(a) : this.parseNums(a);
        const arg2 = float ? this.parseFloats(b) : this.parseNums(b);
        return arg1 + arg2;
      });
    }
    return;
  }

  stripCommas(val) {
    return val.replace(/,/g, '');
  }

  getResponse(val) {
    return angular.isObject(val.data) && val.data.hasOwnProperty('responseStatus') ? 
      val.data : angular.isObject(val) && val.hasOwnProperty('responseStatus') ? val : null;
  }

  isResponseSuccess(response) {
    const _response = this.getResponse(response);
    if (_response) {
      return _response.responseStatus && _response.responseStatus.code && (/2\d\d/).test(_response.responseStatus.code);
    }
    return false;
  }

  isStringOrArray(val) {
    return angular.isString(val) || angular.isArray(val);
  }

  isErrorMessage(val) {
    return this.notNullOrEmptyObj(val) && this.isStringOrArray(val);
  }
  
}
