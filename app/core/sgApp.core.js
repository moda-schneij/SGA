'use strict';

/**
 * @ngdoc overview
 * @name sgAppCore
 * @description
 * Core module of the application.
 */

//this module basically handles all core dependencies of the application
//the core module is then imported by the main application module

import angular from 'angular';

import bindInputValDirective from './directives/bindinputval.directive';
import bindTrustedHtmlDirective from './directives/bindtrustedhtml.directive';
import checkFormEmptyDirective from './directives/checkformempty.directive';
import formOnChangeDirective from './directives/formonchange.directive';
import modaDisableAllInputsDirective from './directives/moda.disableallinputs.directive';
import modaMessagesDirective from './directives/moda.messages.directive';
import modaPleaseWaitDirective from './directives/moda.pleasewait.directive';
import modaScrollToTopDirective from './directives/moda.scrolltotop.directive';
import modaTabsDirective from './directives/moda.tabs.directive';
import modaUiSelectContainerDirective from './directives/modauiselectcontainer.directive';
import modelCurrencyDirective from './directives/modelcurrency.directive';
import modelFloatDirective from './directives/modelfloat.directive';
import modelIntegerDirective from './directives/modelinteger.directive';
import modelPercentageDirective from './directives/modelpercentage.directive';
import ngBindAttrsDirective from './directives/ngbindattributes.directive';
import ngTipsoDirective from './directives/ngtipso.directive';
import percentageFilter from './filters/percentage.filter';
import prettySelectCheckboxDirective from './directives/prettyselectcheckbox.directive';
import setCurrentNavDirective from './directives/setcurrentnav.directive';
import ApplicationSvc from './application.service';
import AuthInterceptorSvc from './authinterceptor.service';
import AuthenticationSvc from './authentication.service';
import CachingSvc from './caching.service';
import sgaConstants from './sgApp.constants';
import ConstantsSvc from './constants.service';
import ContentSvc from './content.service';
import DataSvc from './data.service';
import DialogSvc from './dialog.service';
import MessagesSvc from './messages.service';
import OptionsSvc from './options.service';
import RouteChangeSvc from './routechange.service';
import RulesSvc from './rules.service';
import sgAppSpinnerCtrlSvc from './spinner-control.service';
import sgAppStorageSvc from './storage.service';
import sgAppTimeoutSvc from './timeout.service';
import sgAppTokenSvc from './token.service';
import sgAppUrlSvc from './url.service';
import sgAppUserSvc from './user.service';
import sgAppUtilsSvc from './utils.service';
import sgAppXdMessagingSvc from './xd-messaging.service';
import textToNumModelDirective from './directives/texttonummodel.directive';


export default angular
  .module('sgAppCore', [
    bindInputValDirective.name,
    bindTrustedHtmlDirective.name,
    checkFormEmptyDirective.name,
    formOnChangeDirective.name,
    modaDisableAllInputsDirective.name,
    modaMessagesDirective.name,
    modaPleaseWaitDirective.name,
    modaScrollToTopDirective.name,
    modaTabsDirective.name,
    modaUiSelectContainerDirective.name,
    modelCurrencyDirective.name,
    modelFloatDirective.name,
    modelIntegerDirective.name,
    modelPercentageDirective.name,
    ngBindAttrsDirective.name,
    ngTipsoDirective.name,
    percentageFilter.name,
    prettySelectCheckboxDirective.name,
    setCurrentNavDirective.name,
    sgAppSpinnerCtrlSvc.name,
    sgAppStorageSvc.name,
    sgAppTimeoutSvc.name,
    sgAppTokenSvc.name,
    sgAppUrlSvc.name,
    sgAppUserSvc.name,
    sgAppUtilsSvc.name,
    sgAppXdMessagingSvc.name,
    textToNumModelDirective.name
  ])
  .constant(sgaConstants)
  .service(ApplicationSvc.name, ApplicationSvc)
  .service(AuthenticationSvc.name, AuthenticationSvc)
  .service(AuthInterceptorSvc.name, AuthInterceptorSvc)
  .service(CachingSvc.name, CachingSvc)
  .service(ConstantsSvc.name, ConstantsSvc)
  .service(ContentSvc.name, ContentSvc)
  .service(DataSvc.name, DataSvc)
  .service(DialogSvc.name, DialogSvc)
  .service(MessagesSvc.name, MessagesSvc)
  .service(OptionsSvc.name, OptionsSvc)
  .service(RouteChangeSvc.name, RouteChangeSvc)
  .service(RulesSvc.name, RulesSvc)
  .filter('html', htmlFilterFn);

/*@ngInject*/
function htmlFilterFn($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    }
}
