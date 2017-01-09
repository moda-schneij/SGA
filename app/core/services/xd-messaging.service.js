'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:xdMessaging
 * @description
 * # XdMessaging
 * Service of the Small Group Application app
 */

//this is a service for communicating with SpeedERates through a hidden iframe using postMessage
//the iframe is in the root component - could also be in the template
//it is always there so we can pass tokens, login, and logout from SGA

export default class XdMessagingSvc {
  
  /*@ngInject*/
  constructor ($log, ConstantsSvc, $window, SpinnerControlSvc, UserSvc, TokenSvc) {
    this.$log = $log;
    this.SER_CONTEXT = ConstantsSvc.SER_CONTEXT;
    this.$window = $window;
    this.SpinnerControlSvc = SpinnerControlSvc;
    this.UserSvc = UserSvc;
    this.TokenSvc = TokenSvc;
    this.handleXdTokenResponse = this.handleXdTokenResponse.bind(this);
  }

  //generic postMessage method that takes a message and then sets a target window and origin, depending on what's passed
  postMessage(message, otherWindow, targetOrigin = '*') {
    let serFrame = angular.element(document)[0].getElementById('serframe');
    if (serFrame) {
      serFrame = serFrame.contentWindow;
    }

    var targetWindow = otherWindow ? otherWindow : serFrame ? serFrame : null;
    //var targetWindow = otherWindow ? otherWindow : this.SER_CONTEXT ? this.$window : serFrame;
    if (targetWindow) {
      targetWindow.postMessage(message, targetOrigin);
      this.$log.debug(message, targetWindow, targetOrigin);
    }
  }
  
  //handler for messages coming back from SER
  //SER has similar mechanisms on its side. These are coupled sets of
  /*On verified token response (first token retrieved) call to UserSvc.setIsLoggedIn
  triggers navigation to the application forms*/
  handleXdTokenResponse(e) {
    var origin = e.origin || e.originalTarget.origin;
    var xdRequest = origin !== (location.protocol + '//' + location.host);
    var source = e.source;
    var existingToken = this.TokenSvc.getToken();
    var isTokenResponse = Boolean(e.data.xdTokenResponse) && e.data.xdTokenResponse !== 'null' && e.data.xdTokenResponse !== 'undefined';
    var isTokenStoredMessage = Boolean(e.data.xdTokenStoredMessage) && e.data.xdTokenStoredMessage !== 'null' && e.data.xdTokenStoredMessage !== 'undefined';
    this.SpinnerControlSvc.stopSpin();
    if (xdRequest) {
      this.$log.debug('I\'ve received a response: ' + (isTokenResponse ? 'It\'s a token!' : isTokenStoredMessage ? 'It\'s a notice that a token was stored!' : 'huh?'));
      if (isTokenResponse) { //this is a login event
        this.$log.debug('I\'m setting a token! ' + e.data.xdTokenResponse);
        this.TokenSvc.setToken(e.data.xdTokenResponse);
        this.UserSvc.setIsLoggedIn(); //triggers navigation to the application forms
      } else if (isTokenStoredMessage) {
        if (!existingToken) {
          this.$log.debug('I\'m requesting a token!');
          var messageToPost = {
            xdTokenRequest: true
          };
          source.postMessage(messageToPost, origin);
        }
      } else {
        this.UserSvc.loginFailed();
      }
    }
  }
  
}
