'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:application
 * @description
 * # Application
 * Service of the Small Group Application app
 * The service that's responsible for getting the payload and setting the application, rules, and options in client storage
 */

import angular from 'angular';
//DUMMYING in RULES object: TODO - remove when implemented
//const rulesObj = require('json!./rules.json');
//const mockData = require('json!./sgaData.json');
const failedCheckinMessage = require('!html!../templates/failedcheckin.html');
//DUMMYING in RULES object: TODO - remove when implemented

export default class ApplicationSvc {

  /*@ngInject*/
  constructor($q, $log, DialogSvc, SpinnerControlSvc, UtilsSvc, StorageSvc, AuthenticationSvc, DataSvc, UserSvc, ConstantsSvc, RulesSvc, OptionsSvc, STORAGE_KEYS, FAKE_APPID, DIALOGS) {
    this.$q = $q;
    this.$log = $log;
    this.DialogSvc = DialogSvc;
    this.SpinnerControlSvc = SpinnerControlSvc;
    this.UtilsSvc = UtilsSvc;
    this.StorageSvc = StorageSvc;
    this.AuthenticationSvc = AuthenticationSvc;
    this.DataSvc = DataSvc;
    this.UserSvc = UserSvc;
    this.RulesSvc = RulesSvc;
    this.OptionsSvc = OptionsSvc;
    this.SER_CONTEXT = ConstantsSvc.SER_CONTEXT;
    this.FAKE_APPID = FAKE_APPID;
    this.DIALOGS = DIALOGS;
    this.EIN_KEY = STORAGE_KEYS.EIN_KEY;
    this.QUOTEID_KEY = STORAGE_KEYS.QUOTEID_KEY;
    this.APPID_KEY = STORAGE_KEYS.APPID_KEY;
    this.APPLICATION_KEY = STORAGE_KEYS.APPLICATION_KEY;
    this.OPTIONS_KEY = STORAGE_KEYS.OPTIONS_KEY;
    this.RULES_KEY = STORAGE_KEYS.RULES_KEY;
    this.getApplication = this.getApplication.bind(this);
    this.getAppID = this.getAppID.bind(this);
    this.setApplication = this.setApplication.bind(this);
    this.checkin = this.checkin.bind(this);
    this.setManualProcess = this.setManualProcess.bind(this);
  }

  getApplication() {
    const existingApp = this.StorageSvc.getSessionStore(this.APPLICATION_KEY); //this is the stored application data, if it exists
    const isLoggedIn = this.UserSvc.getIsLoggedIn();
    if (isLoggedIn && existingApp) {
      return existingApp; //return an existing application
    } 
    return; //user is not logged in
  }

  restoreApplication() {
    const deferred = this.$q.defer();
    const appId = this.StorageSvc.getSessionStore(this.APPID_KEY);
    const isLoggedIn = this.UserSvc.getIsLoggedIn();
    const thisObj = angular.extend({ deferred: deferred }, this);
    if (isLoggedIn && appId) {
      this.DataSvc.application.get(appId).then(
        fetchApplicationSuccess.bind(thisObj),
        fetchApplicationFailure.bind(thisObj)
      );
    } else {
      deferred.resolve(false);
    }
    return deferred.promise;
  }

  getAppID() {
    const existingAppID = this.StorageSvc.getSessionStore(this.APPID_KEY); //this is the stored application data, if it exists
    const isLoggedIn = this.UserSvc.getIsLoggedIn();
    if (isLoggedIn && existingAppID) {
      return existingAppID; //return an existing application
    } 
    return; //user is not logged in
  }

  setAppID(id) {
    this.StorageSvc.setSessionStore(this.APPID_KEY, id);
  }

  clearAppID() {
    this.StorageSvc.removeSessionStore(this.APPID_KEY);
  }

  getInitialApplication(idObj) { //pass optional object that has either a quoteId or appId, to get or create new application
    const deferred = this.$q.defer();
    const quoteId = idObj.quoteId;
    const appId = idObj.appId ? idObj.appId : this.getAppID();
    const ein = idObj.ein; //the ein is passed now with the request to get an app by quoteid
    const existingApp = this.StorageSvc.getSessionStore(this.APPLICATION_KEY); //check if there's a stored application (shouldn't be)
    const isLoggedIn = this.UserSvc.getIsLoggedIn();
    const thisObj = angular.extend({ deferred: deferred }, this);
    if (isLoggedIn) {
      if (!existingApp) {
        this.SpinnerControlSvc.startSpin({overlay: true});
        if (quoteId) {
          //bind thisObj passing context to the success callback, which includes the instance of $q.defer() [const deferred]
          this.DataSvc.application.create({
            quoteId: quoteId,
            ein: ein
          }).then(
            fetchApplicationSuccess.bind(angular.extend({}, {ein: ein}, thisObj)),
            fetchApplicationFailure.bind(thisObj)
          );
          //TODO - favor getting app, quoteId, and EIN from the payload
          this.StorageSvc.setSessionStore(this.QUOTEID_KEY, quoteId);
          this.StorageSvc.setSessionStore(this.EIN_KEY, ein);
        } else if (appId) {
          this.DataSvc.application.get(appId).then(
            fetchApplicationSuccess.bind(thisObj),
            fetchApplicationFailure.bind(thisObj)
          );
          //TODO - favor getting app and quote ids from the payload
          this.StorageSvc.setSessionStore(this.APPID_KEY, appId);
        } else {
          if (this.SER_CONTEXT) {
            deferred.resolve(false);
            this.SpinnerControlSvc.stopSpin();
            this.AuthenticationSvc.logout();
          } else {
            this.DataSvc.application.get(this.FAKE_APPID).then(
              fetchApplicationSuccess.bind(angular.extend({}, {fakeApp: true}, thisObj)),
              fetchApplicationFailure.bind(thisObj)
            );
          }
        }
      } else {
        deferred.resolve(existingApp); //return an existing application, if it's stored already
      }
    } else { //not logged in
      deferred.resolve(false); //user is not logged in
    }
    return deferred.promise;
  }

  setApplication(appObj) {
    this.StorageSvc.setSessionStore(this.APPLICATION_KEY, angular.toJson(appObj));
  }

  populateSections(jsonOrObj) {
    const returnArr = []; //reset the sections
    const sections = angular.fromJson(jsonOrObj); //fromJson is a simple wrapper around JSON.parse, and seems to handle this correctly
    angular.forEach(sections, function(sectionObj) {
      populateSection.apply(this, [returnArr, sectionObj]);
    });
    return returnArr;
  }

  //with no option, checkin returns the user to SER after providing a confirmation modal, but doesn't logout
  //for logout (below), we will pass the option logout:true and then continue to logout after confirmation
  checkin(option) {
    const appId = option && option.appId ? option.appId : this.StorageSvc.getSessionStore(this.APPID_KEY);
    const prompt = option && option.prompt && !option.logout;
    //call the service to checkin
    if (appId) {
      if (prompt) {
        this.AuthenticationSvc.unsavedChangesDialog(angular.extend({}, option, {
          checkin: true,
          appId: appId
        })).then(
          (value) => {
            this.DataSvc.application.checkin(appId).then(
              (response) => {
                this.setApplication(null); //just set to null here instead of response, in case the appObj is still there
                this.AuthenticationSvc.returnToSER(); //do not call with context, since this is in another service, which has its own class context
              }, 
              (response) => {
                this.setApplication(null); //just set to null here instead of response, because the appObj should still be there
                failedCheckinDialog.call(this, response);
              }
            );
          },
          () => {
            this.$log.debug('cancelling logout');
          }
        );
      } else {
        dataSvcCheckin.call(this, angular.extend({}, option, {
          checkin: true,
          appId: appId
        }));
      }
    } else {
      thankYouDialog.apply(this, [`<p>You are being logged out. 
        Please log back in to SpeedERates to return to Small Group Application.</p>`, 
        {
          logout: true
        }]);
    }
  }

  delete(appdata) {
    const _appdata = appdata ? appdata : this.StorageSvc.getSessionStore(this.APPLICATION_KEY);
    this.DialogSvc.confirm({
      heading: 'Are you sure?',
      text: `
        <p>You can cancel this request and continue your work, 
        <br>or continue to delete the application.</p>
      `,
      confirmButton: 'Delete',
      cancelButton: 'Continue application'
    }, {
      appendClassName: 'dialog-sga-normal',
      closeByEscape: false,
      closeByDocument: false
    })
    .then(
      (value) => {
        this.DataSvc.application.delete(_appdata).then(
          (response) => {
            actionSuccess.apply(this, [response, {delete: true}]); 
          }, (reason) => {
            actionFailure.apply(this, [reason, {delete: true}]);
          }          
        );
      },
      (reason) => {
        this.$log.debug('cancelling delete application');
      }
    );
  }

  setManualProcess(vm, dialogOptions) {
    const headingText = dialogOptions && dialogOptions.headingText ? 
      dialogOptions.headingText : this.DIALOGS.manualProcess.heading;
    const dialogText = dialogOptions && dialogOptions.dialogText ? 
      dialogOptions.dialogText : this.DIALOGS.manualProcess.text;
    const cancelButton = dialogOptions && dialogOptions.cancelButton ? 
      dialogOptions.cancelButton : 'Back to SpeedERates';
    const confirmButton = dialogOptions && dialogOptions.confirmButton ? 
      dialogOptions.confirmButton : 'Manual process';
    const cancel = angular.isObject(dialogOptions) && dialogOptions.hasOwnProperty('cancel') ? 
      dialogOptions.cancel : false;
    this.DialogSvc.confirm({
      heading: headingText,
      text: dialogText,
      confirmButton: confirmButton,
      cancelButton: cancelButton
    }, {
      appendClassName: 'dialog-sga-normal',
      closeByEscape: false,
      closeByDocument: false
    })
    .then(
      (value) => {
        const appdata = vm && vm.appdata ? vm.appdata : this.StorageSvc.getSessionStore(this.APPLICATION_KEY);
        this.SpinnerControlSvc.startSpin({overlay: true});
        this.DataSvc.application.setManual(appdata)
          .then(
            (response) => {
              actionSuccess.apply(this, [response, {manual: true}]);
            }, (reason) => {
              actionFailure.apply(this, [reason, {manual: true}]); //recurse back to this function to show manual process failure text and return to SER
            }
          )
          .finally(() => {
             this.SpinnerControlSvc.stopSpin();
          });
      },
      (reason) => {
        if (cancel) {
          this.$log.debug('cancelling manual process');
        } else {
          this.checkin(); //go through checkin and then return to SER will follow - pass no options
        }
      }
    );
  }

  logout() {
    this.checkin({logout:true});
  }

  //called by the app component svc
  enrollSuccess(response, vm) {
    actionSuccess.apply(this, [response, {
      enroll: true,
      vm: vm
    }]);
  }

  enrollFailure(reason, vm) {
    actionFailure.apply(this, [reason, {
      enroll: true,
      vm: vm
    }]);
  }

} // end class ApplicationSvc declaration

/*a dialog to just tell the user that checkin failed - but the app should now be null
and returnToSER will continue, wiping all client data*/
function failedCheckinDialog(reason) { //if we ever need to get at the error itself...
  this.DialogSvc.acknowledge({
    heading: 'We\'re sorry',
    text: failedCheckinMessage
  }, {
    appendClassName: 'dialog-sga-normal',
    closeByEscape: false,
    closeByDocument: false
  })
  .then(function() {
    this.AuthenticationSvc.returnToSER(); //always just return to speedE
  }.bind(this));
}

function dataSvcCheckin(option) {
  const appId = option && option.appId ? option.appId : this.StorageSvc.getSessionStore(this.APPID_KEY);
  this.DataSvc.application.checkin(appId)
    .then(
      (response) => {
        this.setApplication(response.data.application);
        actionSuccess.apply(this, [response, option]);
      },
      (response) => {
        this.setApplication(response.data.application);
        actionFailure.apply(this, [response, option]);
      }      
    );
}

//in either case (success or failure) throw a confirmation that then leads to either logout or return to SER
//depending on the calling option
function actionSuccess(response, option) {
  if (!this.UtilsSvc.isResponseSuccess(response)) {
    actionFailure.apply(this, [response, option]);
  } else {
    //prompt is only passed if turning off - default s/b true
    const prompt = option && angular.isDefined(option.prompt) ? option.prompt : true;
    const logout = option && option.logout; //means this is being called by logout, instead of directly
    const dirty = option && option.dirty; //indicates there's unsaved changes at this point
    const deleteOpt = option && option.delete;
    const checkin = option && (option.checkin && !option.logout);
    const enroll = option && option.enroll;
    const manual = option && option.manual;
    var medGrgrId = '';
    var denGrgrId = '';
    if (response.data.application && response.data.application.group){
      denGrgrId = response.data.application.group.denGrgrId;
      medGrgrId = response.data.application.group.medGrgrId;
    }
    const grgrIdsMsgInfo = 'Group ID - (' + medGrgrId + ' ' + denGrgrId + ')';
    const infoMsgs = response && response.data 
      response.data.responseStatus && 
      angular.isArray(response.data.responseStatus.infoMsg) ? 
      response.data.responseStatus.infoMsg.filter((msg) => !(msg.toLowerCase === 'ok')) : [];
    const hasInfoMessages = infoMsgs.length > 0;
    const enrollMsg = '<p>You have successfully enrolled your application in Facets.</p> <p>' + grgrIdsMsgInfo + '.</p>' +
      (hasInfoMessages ? createMessageList(response.data.responseStatus.infoMsg) : '') + 
      '<p>You will now return to SpeedERates.</p>';
    //TODO - actually inspect the response before treating as success
    this.$log.debug('Your application action was handled successfully.');
    this.$log.debug(response.data);
    const dialogText = logout ? //different text for logout, delete, and plain checkin (return to SER)
      `<p>You have logged out. 
      You will now return to SpeedERates login.</p>` : 
      deleteOpt ? //delete is a reserved word
      `<p>The application has been successfully deleted. 
      You will now return to SpeedERates.</p>` : 
      enroll ? enrollMsg : 
      manual ? 
      `<p>Your application was set to manual process status. 
      You will now return to SpeedERates.</p>` : 
      `<p>You have checked in your application. 
      You will now return to SpeedERates.</p>`;
    if (!prompt) {
      checkinLogoutOrReturnSER.call(this, option);
    } else {
      thankYouDialog.apply(this, [dialogText, option]);
    }
  }
}

function actionFailure(error, option) {
  const getApplication = option && option.getApplication;
  const logout = option && option.logout; //means this is being called by logout, instead of directly
  const dirty = option && option.dirty; //indicates there's unsaved changes at this point
  const deleteOpt = option && option.delete; //delete is a reserved word, so using "deleteOpt" here
  const checkin = option && (option.checkin && !option.logout);
  const enroll = option && option.enroll;
  const manual = option && option.manual;
  const vm = option && option.vm; //the viewmodel passed from a calling component or service that itself is called from a component
  const headingText = 'We\'re sorry';
  const errorMsg = error && error.data && angular.isString(error.data) ? '<p>' + error.data + '</p>' : //there is just a single error
    error && error.data && 
    error.data.responseStatus && 
    angular.isArray(error.data.responseStatus.errorMsg) && 
    error.data.responseStatus.errorMsg.filter((msg) => msg && angular.isDefined(msg)).length > 0 ? //there are multiple errors in the errorMsg array
    createMessageList(error.data.responseStatus.errorMsg.filter((msg) => msg && angular.isDefined(msg))) :
    '<p>Unknown error. Please consult application logs.</p>'
  const dialogText = deleteOpt ?
    `<p>Deletion of this application failed.</p>
    <p>Please contact the web team for assitance. 
    You will now return to SpeedERates.</p>` : 
    checkin ? failedCheckinMessage :
    enroll ?
    `<p>The application failed to enroll in Facets. 
    Please inspect the following error(s), and report to the web team.</p>
    ${errorMsg}
    <p>You may choose to set this application for "Manual process" or simply return to SpeedERates,
    where you can take further action or delete this application and create a new one.</p>` : 
    manual ?
    `<p>The application could not be set to manual process. 
    Please contact the web team for assitance. 
    You will now return to SpeedERates</p>` : 
    getApplication ? 
    `<p>The application failed to load. 
    Please inspect the following error(s), and report to the web team.</p>
    <p>${errorMsg}</p>
    <p>You will now return to SpeedERates</p>
    ` : //default
    `<p>The action you were trying to perform failed. You will now return to SpeedERates</p>`;
  this.$log.error('Application action (checkin, delete, enroll) has failed.');
  this.$log.error(error);
  if (enroll) {
    this.setManualProcess(vm, {
      headingText: headingText,
      dialogText: dialogText
    });
  } else {
    this.DialogSvc.acknowledge({
      heading: headingText,
      text: dialogText
    }, {
      appendClassName: 'dialog-sga-normal',
      closeByEscape: false,
      closeByDocument: false
    }).then(() => {
      checkinLogoutOrReturnSER.call(this, option);
    });
  }
}

function createMessageList(msgArr) {
  const listItems = msgArr.map((msg) => '<li>' + msg + '</li>').join('');
  return '<ul class="bulleted-list">' + listItems + '</ul>';
}

function thankYouDialog(dialogText, option) {
  this.DialogSvc.acknowledge({
    heading: 'Thank you for using Small Group Automation',
    text: dialogText
  }, {
      appendClassName: 'dialog-sga-normal',
      closeByEscape: false,
      closeByDocument: false
  })
  .then(() => {
    checkinLogoutOrReturnSER.call(this, option);
  });
}

function checkinLogoutOrReturnSER(option) {
  const logout = option && option.logout; //means this is being called by logout or another request to logout, instead of directly
  const appObj = this.getApplication();
  const hasAppObj = angular.isObject(appObj) && appObj !== 'null';
  const appId = this.getAppID();
  const hasAppId = this.UtilsSvc.isNumberOrNumString(appId);
  logout ? 
    this.AuthenticationSvc.logout({error: false, expired: false}) : 
    (hasAppObj && hasAppId) ? 
    this.checkin({appId: appId, prompt: false}) : //if the appObj still exists, checkin hasn't happened yet
    this.AuthenticationSvc.returnToSER();
}

function fetchApplicationSuccess(_response) {
  //depending on whether this results from use of $http or $resource promise
  //the needed objects either are or aren't on a nested "data" object
  let response = angular.isDefined(_response.data) ? _response.data : _response;
  //attempt to normalize the $resource promise response
  response = JSON.parse(angular.toJson(response));
  const appObj = this.UtilsSvc.checkAndSetToNull(response.application); //the application itself
  const optionsObj = this.UtilsSvc.checkAndSetToNull(response.options); //metadata for the ui (mostly selects)
  const rulesObj = this.UtilsSvc.checkAndSetToNull(response.rules); //rules for the ui, validations
  this.$log.debug(appObj);
  if (appObj) {
    this.setApplication(appObj);
    this.StorageSvc.setSessionStore(this.APPID_KEY, appObj.applicationId);
  }
  if (optionsObj) {
    this.OptionsSvc.options = optionsObj;
    //this.StorageSvc.setSessionStore(this.OPTIONS_KEY, optionsObj);
  }
  if (rulesObj) {
    //TODO - use real rules object from back-end
    this.RulesSvc.rules = rulesObj; //setting rules in storage using the rules service setter
  }
  this.deferred.resolve(appObj);
}

function fetchApplicationFailure(error) {
  this.$log.error('failure to get application object in application service');
  this.$log.error(error);
  this.SpinnerControlSvc.stopSpin();
  this.deferred.resolve(false);
  actionFailure.apply(this, [error, {
    getApplication: true
  }]);
}

function populateSectionContent(contentArr) {
  const sectionArr = [];
  angular.forEach(contentArr, function(value, prop) {
    sectionArr.push({
      name: prop,
      value: value
    })
  });
  return sectionArr;
}

function populateSection(returnArr, sectionObj) {
  const section = {};
  section.content = [];
  angular.forEach(sectionObj, function(value, prop) {
    if (prop === 'content') {
      section.content = populateSectionContent(value);
    } else {
      section[prop] = value;
    }
  });
  returnArr.push(section);
}
