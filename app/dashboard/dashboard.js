'use strict';

angular.module('eKlub.dashboard', ['ngRoute', 'oauth'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'dashboard/dashboard.html',
		controller: 'DashboardController'
	});
}])

.controller('DashboardController', function($scope, $timeout, AuthService, AccessToken) {

	AuthService.init();
	// AuthService.setAccessToken(AccessToken.get().access_token);
	AuthService.setAccessToken(AccessToken.get().access_token);

	$timeout(function() {
		// $scope.logged = !!AccessToken.get();
		
	}, 2000)

	// AuthService.init();

	// $scope.$on('oauth:login', function(event, token) {
	// 	console.log('yo');
	// 	console.log(token.access_token);
	// 	$scope.accessToken = token.access_token;
	// });

	// $scope.$on('oauth:logout', function(event) {
	// 	$scope.accessToken = null;
	// });

});