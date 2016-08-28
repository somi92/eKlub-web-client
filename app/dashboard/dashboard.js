'use strict';

angular.module('eKlub.dashboard', ['ngRoute', 'oauth'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'dashboard/dashboard.html',
		controller: 'DashboardController'
	});
}])
.factory('dashboardFactory', function($http, AccessToken) {

	$http.defaults.headers.common.Authorization = "Bearer " + (AccessToken.get() != null ? AccessToken.get().access_token : "");

	var getStatsUrl = "http://localhost:8080/stats";
	
	var dashboardFactory = {};

	dashboardFactory.getEntitiesStats = function() {
		return $http.get(getStatsUrl + "/entities");
	}

	dashboardFactory.getCategoriesStats = function() {
		return $http.get(getStatsUrl + "/categories");
	}

	dashboardFactory.getAttendancesStats = function() {
		return $http.get(getStatsUrl + "/attendances");
	}

	return dashboardFactory;
})
.controller('DashboardController', function($scope, $timeout, dashboardFactory, AuthService, AccessToken) {

	AuthService.setAccessToken(AccessToken.get() != null ? AccessToken.get().access_token : "");

	init();

	function init() {

		dashboardFactory.getEntitiesStats()
		.then(function(response) {
			$scope.memberStats = response.data.payload.filter(e => e.label == "Member")[0].value;
			$scope.groupStats = response.data.payload.filter(e => e.label == "`Group`")[0].value;
			$scope.trainingStats = response.data.payload.filter(e => e.label == "Training")[0].value;
			$scope.paymentStats = response.data.payload.filter(e => e.label == "Payment")[0].value;
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) { });

		dashboardFactory.getCategoriesStats()
		.then(function(response) {
			var categoriesStats = response.data.payload;
			createCategoriesGraph(categoriesStats);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) { });

		dashboardFactory.getAttendancesStats()
		.then(function(response) {
			var attendancesStats = response.data.payload;
			createAttendancesGraph(attendancesStats);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) { });
	}

	function createAttendancesGraph(data) {
		Morris.Donut({
			element: 'attendances-donut-chart',
			data: data,
			resize: true
		});
	}

	function createCategoriesGraph(data) {
		Morris.Bar({
			element: 'categories-bar-chart',
			data: data,
			xkey: 'label',
			ykeys: ['value'],
			labels: ['Broj članova'],
			hideHover: 'auto',
			resize: true
		});

	}
});