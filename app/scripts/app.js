'use strict';

var app = angular.module('kulak.CFBE', [
  'ui.router',
  'ui.router.stateHelper',
  'ui.bootstrap',
  'ngAnimate'
])

.config(['$stateProvider', 'stateHelperProvider', '$urlRouterProvider', function($stateProvider, stateHelperProvider, $urlRouterProvider) {

  $urlRouterProvider.when('','/');

  var mainState = {
    name: 'main',
    url: '/',
    views: {
      'content': {
        templateUrl: 'templates/main.html',
        controller: function($rootScope) {
          $rootScope.subpage = false;
        }
      }
    }
  };

  var mainPlState = {
    name: 'main_pl',
    url: '/pl',
    views: {
      'content': {
        templateUrl: 'templates/main_pl.html',
        controller: function($rootScope) {
          $rootScope.subpage = false;
        }
      }
    }
  };

  var subpageState = {
    name: 'subpage',
    url: '/:lang/:id',
    views: {
      'content': {
        templateUrl: function($stateParams) {
          return 'templates/subpage/' + $stateParams.lang + '/' + $stateParams.id + '.html';
        },
        controller: function($rootScope) {
          $rootScope.subpage = true;
        }
      }
    }
  };


  stateHelperProvider.setNestedState({
    name: 'root',
    views: {
      root: {
        templateUrl: 'templates/layout.html'
      }
    },
    data: {
      requiresLogin: true
    },
    children: [
      mainState,
      mainPlState,
      subpageState
    ]
  }, true);

  }]);