'use strict';

angular.module('eKlub.dashboard', ['ngRoute', 'oauth'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'dashboard/dashboard.html',
		controller: 'DashboardController'
	});
}])

.controller('DashboardController', function($scope, $timeout, AuthService, AccessToken) {

	AuthService.setAccessToken(AccessToken.get() != null ? AccessToken.get().access_token : "");
});