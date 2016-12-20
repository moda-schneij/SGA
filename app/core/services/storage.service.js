'use strict';

/**
 * @ngdoc function
 * @name smallGroupApplication.service:storage
 * @description
 * # Storage
 * Service of the Small Group Application App
 */

import angular from 'angular';

export default class StorageSvc {

  /*@ngInject*/
  constructor($window, $log) {
    this.$window = $window;
    this.$log = $log;
    this.$sessionStore = this.$window.sessionStorage;
    this.$localStore = this.$window.localStorage;
  }

  //set up all permutations of useStore, passing booleans and null values that switch local/session, and get/set/remove

  setSessionStore(key, value) {
    useStore.apply(this, [key, value, true]);
  }

  getSessionStore(key) {
    return getStoreVal.apply(this, [key, true]);
  }

  setLocalStore(key, value) {
    useStore.apply(this, [key, value]);
  }

  getLocalStore(key) {
    return getStoreVal.apply(this, [key]);
  }

  removeSessionStore(key) {
    useStore.apply(this, [key, null, true]);
  }

  removeLocalStore(key) {
    useStore.apply(this, [key]);
  }

  clearStores(typeVal) {
    checkStorageAvailable.call(this);
    var type = typeVal && angular.isString(typeVal) ? typeVal : null;
    if (type) {
      if (type === 'session') {
        this.$window.sessionStorage.clear();
      } else if (type === 'local') {
        this.$window.localStorage.clear();
      } else if (type === 'all') {
        clearAllStores.call(this);
      } else {
        clearAllStores.call(this);
      }
    } else {
      clearAllStores.call(this);
    }
  }

}

function getStoreVal(key, session) {
  return useStore.apply(this, [key, null, session, true]);
}

function checkStorageAvailable() {
  try {
    // Test webstorage existence.
    if (!this.$window.localStorage || !this.$window.sessionStorage) {
      throw "Web storage not available";
    }
    // Test webstorage accessibility - Needed for Safari private browsing, or other incognito, etc
    // setItem should throw an error if the client has no private-mode workaround for web storage APIs
    this.$window.sessionStorage.setItem('storage_test', 1);
    this.$window.sessionStorage.removeItem('storage_test');
    this.$window.localStorage.setItem('storage_test', 1);
    this.$window.localStorage.removeItem('storage_test');
  } catch (e) {
    handleStorageErr.call(this);
  }
}

function handleStorageErr() {
  this.$window.confirm('Web storage must be enabled for this application to work.');
  return;
}

function useStore(keyVal, valueVal, sessionVal, getVal) {
  var session = sessionVal && typeof sessionVal === 'boolean' ? sessionVal : false;
  var key = keyVal && angular.isString(keyVal) ? keyVal : null;
  var get = getVal && typeof getVal === 'boolean' ? getVal : false;
  var value = valueVal && angular.isString(valueVal) ? valueVal :
    valueVal && angular.isObject(valueVal) ? angular.toJson(valueVal) :
      valueVal && (typeof valueVal === 'boolean' || angular.isNumber(valueVal)) ? valueVal.toString() : null;
  var storeReturnVal;
  var storeParsedVal;

  checkStorageAvailable.call(this); //if this fails, we abort

  if (key) { //if there's no key, this fails (only get key, set key, or remove key)
    if (value) { //setters
      setters.call(this);
    } else {
      if (get) { //getters
        return getters.call(this);
      } else { //set without value is remove
        removers.call(this);
      }
    }
  } else {
    this.$log.debug('attempt to use web storage without providing a key name');
  }

  function getters() {
    if (session) {
      storeReturnVal = this.$window.sessionStorage.getItem(key);
    } else {
      storeReturnVal = this.$window.localStorage.getItem(key);
    }
    //parse booleans as strings
    if (storeReturnVal === 'true' || storeReturnVal === 'false') {
      storeReturnVal = storeReturnVal === 'true';
    } else if (!isNaN(parseFloat(storeReturnVal))) {
      storeReturnVal = parseFloat(storeReturnVal);
    } else {
      //attempt to parse objects as strings
      try {
        storeParsedVal = angular.fromJson(storeReturnVal);
      } catch(e) {
        //value cannot be parsed
      } finally {
        if (storeParsedVal) {
          storeReturnVal = storeParsedVal;
        }
      }
    }
    return storeReturnVal;
  }

  function setters() {
    if (session) {
      this.$window.sessionStorage.setItem(key, value);
    } else {
      this.$window.localStorage.setItem(key, value);
    }
  }

  function removers() {
    if (session) {
      this.$window.sessionStorage.removeItem(key);
    } else {
      this.$window.localStorage.removeItem(key);
    }
  }
}

function clearAllStores(params) {
  const {$window} = this;
  const local = params && params.type && params.type === 'local';
  const session = params && params.type && params.type === 'session';
  if (params) {
    const storageType = params.type + 'Storage';
    if ($window.hasOwnProperty(storageType)) {
      $window[storageType].clear();
    }
  } else {
    $window.localStorage.clear();
    $window.sessionStorage.clear();
  }
}
