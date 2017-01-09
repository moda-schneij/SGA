'use strict';

/**
 * @ngdoc function
 * @name riskShareApp.service:Timeout
 * @description
 * # Timeout
 * Service of the riskShareApp
 */

//All the global stuff that need to happen on route change start and success

import angular from 'angular';
const moduleName = 'sgAppTimeoutSvc';

class TimeoutSvc {

  /*@ngInject*/
  constructor($log, $timeout, $interval, AuthenticationSvc, DataSvc, DialogSvc, ngDialog, ApplicationSvc, $rootScope, TIMEOUT_MINS) {
    this.$log = $log;
    this.$timeout = $timeout;
    this.$interval = $interval;
    this.AuthenticationSvc = AuthenticationSvc;
    this.DataSvc = DataSvc;
    this.DialogSvc = DialogSvc;
    this.ngDialog = ngDialog;
    this.ApplicationSvc = ApplicationSvc;
    this.$rootScope = $rootScope;
    this.minute = 60 * 1000;
    this.timeoutTime = TIMEOUT_MINS;
    this.warningTime = this.timeoutTime - 2;
    this.remainingTime = this.timeoutTime - this.warningTime;
    this.timeoutLength = this.timeoutTime * this.minute + 1000; //timeout in milliseconds, plus a padding of 1 second to exceed the server-side timeout length
    this.timeToWarning = this.warningTime * this.minute;
    this.warningLength = this.remainingTime * this.minute; //approx 2 minutes before a timeout will be run, for triggering a dialog prompt to the user
    this.warningPromise;
    this.setUserTimeout = this.setUserTimeout.bind(this);
    this.cancelUserTimeout = this.cancelUserTimeout.bind(this);
  }

  cancelUserTimeout() {
    if (angular.isDefined(this.warningPromise)) {
      this.$timeout.cancel(this.warningPromise); //cancel an existing timeout to warning
    }
  }

  /*this establishes and resets the timeout and warning. It is
  called each time there's a successful ajax call to a service (in the authinterceptor service), 
  which first happens on login.
  */
  setUserTimeout(secondsToWarning) {
    const timeToWarning = secondsToWarning ? secondsToWarning * 1000 : this.timeToWarning;
    this.cancelUserTimeout(); //cancel an existing timeout to warning
    //set a new timeout to warning
    this.warningPromise = this.$timeout(warnTimeout.bind(this, {minutes: this.remainingTime}), timeToWarning);
  }

  testTimeout() { //very short timeout dialog
    warnTimeout.call(this, {
      minutes: '0',
      seconds: '10'
    });
  }

}

function warnTimeout(timeObj) {
  const minutes = timeObj && timeObj.minutes ? timeObj.minutes : this.remainingTime;
  const seconds = timeObj && timeObj.seconds ? timeObj.seconds : '00';
  this.$rootScope.timeObj = {
    minutes: minutes,
    seconds: seconds,
    expired: false //this is used to control the dialog itself and prevent the continue action from running on true timeout
  };
  //this is the actual timeout timer for the dialog
  //kicks in after the timeToWarning timeout triggers the warnTimeout function
  const updateInterval = this.$interval(() => {
    //bind to $rootScope so that the DialogSvc can apply a dynamically updating value in the dialog text (the timer) -> see below
    this.$rootScope.timeObj = updateTime.apply(this, [this.$rootScope.timeObj, updateInterval, timeoutDialog]);
  }, 1000);
  const timeoutDialog = this.DialogSvc.confirm({
    heading: 'Timeout warning',
    text: `
      <p>You have not updated or saved your application in the past ${this.warningTime} minutes.
      Your you will automatically be logged out after ${this.timeoutTime} minutes of inactivity.</p> 
      <p>Until then, you may choose to continue working on your application or return to SpeedERates.</p>
      <p>Time remaining: 
        <span ng-if="!timeObj.expired">{{timeObj.minutes}}:{{timeObj.seconds}}</span>
        <span ng-if="timeObj.expired">0:00</span>
      </p>
    `,
    confirmButton: 'Continue application',
    cancelButton: 'Return to SpeedERates',
    scope: true //this uses $rootScope as scope in the DialogSvc
  }, {
    appendClassName: 'dialog-sga-normal'
  });
  
  timeoutDialog.then(
    (value) => {
      this.DataSvc.ping(); //refresh the token on click of continue button -> resets the timeout
    },
    () => {
      if (!this.$rootScope.timeObj.expired) { //this runs automatically if I don't prevent it from doing so timeout closes the dialog
        this.ApplicationSvc.checkin(); //don't do this if time has run out - see the logout handler in updateTime
      }
    }
  ).finally(() => {
    this.$interval.cancel(updateInterval);
  });
}

function updateTime(timeObj, intervalFn, timeoutDialog) {
  //on each tick (1000ms), update second, minutes, and the expired boolean (changes only when we reach timeout)
  timeObj.seconds = (/00/).test(timeObj.seconds) ? '59' : 
    String(timeObj.seconds - 1).length === 2 ? 
    timeObj.seconds - 1 : '0' + String(timeObj.seconds - 1);
  timeObj.minutes = (/59/).test(timeObj.seconds) ? timeObj.minutes - 1 : timeObj.minutes;
  timeObj.expired = ((/0/).test(timeObj.minutes) && (/00/).test(timeObj.seconds));
  if (timeObj.expired) { //time has run out!!!
    this.$interval.cancel(intervalFn); //cancel the interval
    this.ngDialog.closeAll(); //hammer approach - I have no handle on the timeoutDialog, specifically
    this.$timeout(() => { //wait a bit to prevent modals colliding
      this.AuthenticationSvc.logout({ //run logout
        expired: true,
        skipSaveChanges: true, //add a new param here for hiding a dialog on logout - the default is false (show save changes dialog)
        prompt: false // no thank you prompt from checkin success
      });
    }, 200);
  }
  return timeObj; //return the updated time object every second for the timer in the modal
}

export default angular
  .module(moduleName, [])
  .service('TimeoutSvc', TimeoutSvc);