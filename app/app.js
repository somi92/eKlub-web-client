'use strict';

// Declare app level module which depends on views, and components
angular.module('eKlub', [
  'ngRoute',
  'eKlub.dashboard',
  'eKlub.members',
  'eKlub.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);
