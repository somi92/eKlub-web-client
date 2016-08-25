'use strict';

angular.module('eKlub.dashboard', ['ngRoute', 'oauth'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'dashboard/dashboard.html',
		controller: 'DashboardController'
	});
}])

.controller('DashboardController', function($scope, $timeout, AccessToken) {

	$timeout(function() {
		// $scope.logged = !!AccessToken.get();
		console.log(AccessToken.get());
	}, 2000)

	$scope.$on('oauth:login', function(event, token) {
		console.log('yo');
		console.log(token.access_token);
		$scope.accessToken = token.access_token;
	});

	$scope.$on('oauth:logout', function(event) {
		$scope.accessToken = null;
	});

});