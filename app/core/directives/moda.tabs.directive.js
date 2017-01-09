'use strict';

/**
 * @ngdoc overview
 * @name sgApp.module:modaTabs
 * @description
 * # modaTabs
 * Module of the Moda Small Group Application app
 */
 
import angular from 'angular';
import sgAppCore from '../sgApp.core';

export default angular.module('modaTabsDirective', [])
  .directive('tabsContainer', tabsContainerDirectiveFn)
  .directive('tabsTab', tabsTabDirectiveFn);

//pilfered in part from http://codereview.stackexchange.com/questions/46927/angularjs-tab-control
//also AngularJS Up & Running, Advanced Directives (tabs examples) http://shop.oreilly.com/product/0636920033486.do

/*@ngInject*/
function tabsContainerDirectiveFn($log, $timeout) {
  return {
    restrict: 'A',
    templateUrl: './app/core/directives/templates/tabs_container.html',
    scope: {
      klass: '@class',
      toggle: '@toggle'
    },
    transclude: true,
    controller: ['$scope', '$element', '$attrs',
      function($scope, $element, $attrs) {
        $log.debug('THE SCOPE OF THE TAB CONTAINER DIRECTIVE');
        $log.debug($scope);

        const toggle = $attrs.toggle || $attrs.toggle === 'true';

        var currentIndex = 0,
            currentTabSelected = 0;
        $scope.tabs = [];

        this.registerTab = function(scope) {
          if (angular.isUndefined(scope.selected)) {
            if ($scope.tabs.length === 0) {
              scope.selected = true;
            } else {
              scope.selected = false;
            }
          }
          $scope.tabs.push(scope);
        };

        $scope.selectTab = function(index) {
          if (toggle && $scope.tabs[index].selected) {
            $scope.tabs[index].selected = false;
            $scope.$emit('tabDeselected');
          } else {
            currentIndex = index;
            for (var i = 0; i < $scope.tabs.length; i++) {
              $scope.tabs[i].selected = currentIndex === i;
            }
            $scope.$emit('tabSelected');
          }
        };

        $scope.isSelectedTab = function(index) {
          return currentIndex === index;
        };
      }
    ]
  };
}

/*@ngInject*/
function tabsTabDirectiveFn($log) {
  return {
    restrict: 'A',
    templateUrl: './app/core/directives/templates/tabs_tab.html',
    transclude: true,
    replace: true,
    scope: {
      name: '@name',
      selected: '=bind' //I am intending for this to be the value from the vm backing the tabs.
    },
    require: '^tabsContainer',
    link: function($scope, $element, $attrs, tabsCtrl) {
      $log.debug('THE SCOPE OF THE TABS TAB DIRECTIVE');
      $log.debug($scope);
      tabsCtrl.registerTab($scope);
    }
  };
}

