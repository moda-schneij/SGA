'use strict';

/**
 * @ngdoc overview
 * @name sgAppCoreDirectives
 * @description
 * Core directives module of the Moda SGA application.
 */

//this module basically handles all core servuce dependencies of the application
//the core services module is then imported by the core module, which is then imported by the application module

import angular from 'angular';

import bindInputValDirective from './bindinputval.directive';
import bindTrustedHtmlDirective from './bindtrustedhtml.directive';
import checkFormEmptyDirective from './checkformempty.directive';
import formOnChangeDirective from './formonchange.directive';
import disableAllInputsDirective from './disableallinputs.directive';
import modaMessagesDirective from './moda.messages.directive';
import modaPleaseWaitDirective from './moda.pleasewait.directive';
import modaScrollToTopDirective from './moda.scrolltotop.directive';
import modelCurrencyDirective from './modelcurrency.directive';
import modelFloatDirective from './modelfloat.directive';
import modelIntegerDirective from './modelinteger.directive';
import modelPercentageDirective from './modelpercentage.directive';
import ngBindAttrsDirective from './ngbindattributes.directive';
import ngTipsoDirective from './ngtipso.directive';
import prettySelectCheckboxDirective from './prettyselectcheckbox.directive';
import setCurrentNavDirective from './setcurrentnav.directive';
import textToNumModelDirective from './texttonummodel.directive';

export default angular
  .module('sgAppCoreDirectives', [
    ngTipsoDirective.name,
    prettySelectCheckboxDirective.name,
    setCurrentNavDirective.name,
    textToNumModelDirective.name
  ])
  .directive('bindInputVal', bindInputValDirective)
  .directive('bindTrustedHtml', bindTrustedHtmlDirective)
  .directive('checkFormEmpty', checkFormEmptyDirective)
  .directive('disableAllInputs', disableAllInputsDirective)
  .directive('formOnChange', formOnChangeDirective)
  .directive('modaMessages', modaMessagesDirective)
  .directive('modaPleaseWait', modaPleaseWaitDirective)
  .directive('modelCurrency', modelCurrencyDirective)
  .directive('modelFloat', modelFloatDirective)
  .directive('modelInteger', modelIntegerDirective)
  .directive('modelPercentage', modelPercentageDirective)
  .directive('ngBindAttributes', ngBindAttrsDirective)
  .directive('scrollToTop', modaScrollToTopDirective);