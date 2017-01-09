'use strict';

/**
 * @ngdoc overview
 * @name sgAppCoreSvcs
 * @description
 * Core services module of the Moda SGA application.
 */

//this module basically handles all core servuce dependencies of the application
//the core services module is then imported by the core module, which is then imported by the application module

import angular from 'angular';

import ApplicationSvc from './application.service';
import AuthInterceptorSvc from './authinterceptor.service';
import AuthenticationSvc from './authentication.service';
import CachingSvc from './caching.service';
import ConstantsSvc from './constants.service';
import ContentSvc from './content.service';
import DataSvc from './data.service';
import DialogSvc from './dialog.service';
import MessagesSvc from './messages.service';
import NavigationSvc from './navigation.service';
import OptionsSvc from './options.service';
import RulesSvc from './rules.service';
import SpinnerCtrlSvc from './spinner-control.service';
import StorageSvc from './storage.service';
import TimeoutSvc from './timeout.service';
import TokenSvc from './token.service';
import UrlSvc from './url.service';
import UserSvc from './user.service';
import UtilsSvc from './utils.service';
import XdMessagingSvc from './xd-messaging.service';

export default angular
  .module('sgAppCoreSvcs', [])
    .service(ApplicationSvc.name, ApplicationSvc)
    .service(AuthenticationSvc.name, AuthenticationSvc)
    .service(AuthInterceptorSvc.name, AuthInterceptorSvc)
    .service(CachingSvc.name, CachingSvc)
    .service(ConstantsSvc.name, ConstantsSvc)
    .service(ContentSvc.name, ContentSvc)
    .service(DataSvc.name, DataSvc)
    .service(DialogSvc.name, DialogSvc)
    .service(MessagesSvc.name, MessagesSvc)
    .service(NavigationSvc.name, NavigationSvc)
    .service(OptionsSvc.name, OptionsSvc)
    .service(RulesSvc.name, RulesSvc)
    .service(SpinnerCtrlSvc.name, SpinnerCtrlSvc)
    .service(StorageSvc.name, StorageSvc)
    .service(TimeoutSvc.name, TimeoutSvc)
    .service(TokenSvc.name, TokenSvc)
    .service(UrlSvc.name, UrlSvc)
    .service(UserSvc.name, UserSvc)
    .service(UtilsSvc.name, UtilsSvc)
    .service(XdMessagingSvc.name, XdMessagingSvc);
