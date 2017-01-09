'use strict';

require('console-polyfill');

export default (function() {
  window.MODA = window.MODA || {};
  var MODA = window.MODA;
  var serContext = location.href.indexOf('/SpeedERatesWeb/sga/') > -1;
  var cookiePath = serContext ? '/SpeedERatesWeb/' : '/';
  MODA.ENV = {
    DEV: location.href.indexOf('.modahealth.com') === -1,
    PROD: location.href.indexOf('.modahealth.com') > -1
  };
  MODA.SGA = MODA.SGA || {};
  MODA.SER = MODA.SER || {};
  MODA.baseDomain = MODA.ENV.DEV ? 
    (location.protocol + '//' + location.hostname + ':9080/') :
    (location.protocol + '//' + location.hostname + '/');
  MODA.SER.baseUrl = MODA.ENV.DEV ? 
    (location.protocol + '//' + location.hostname + ':9080/SpeedERatesWeb/faces/pages/') :
    (location.protocol + '//' + location.hostname + '/SpeedERatesWeb/faces/pages/');
  MODA.SGA.refCookieName = 'moda_sga_referrer';
  var referrer = (function() {
    var _referrer = document.referrer.indexOf('SpeedERatesWeb') > -1 ? 'ser' : 'sga';
    var refTestRegex = new RegExp('(?:(?:^|.*;\\s*)' + MODA.SGA.refCookieName + '\\s*\\=\\s*([^;]*).*$)|^.*$');
    var referrer_cookie = document.cookie.replace(refTestRegex, "$1");
    if (referrer_cookie) {
      return referrer_cookie;
    } else {
      document.cookie = MODA.SGA.refCookieName + '=' + _referrer + '; path="' + cookiePath + '"; expires=0;'
      return _referrer;
    }
  }());
  console.log('document.referrer: ' + referrer);
  // var wsOrProd = /^(9080|9443|80)$/,
  //     inSER = wsOrProd.test(location.port),
  //     baseHREF = inSER ? '/SpeedERatesWeb/sga/' : '/';
  MODA.SGA.appRoot = serContext ? '/SpeedERatesWeb/sga/' : '/';
  MODA.SGA.devMode = !serContext;
  document.write('<base href="' + MODA.SGA.appRoot + '">');
  return MODA;
}());