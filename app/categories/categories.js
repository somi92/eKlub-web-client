'use strict';

angular.module('eKlub.categories', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/categories', {
    templateUrl: 'categories/categories.html',
    controller: 'CategoriesController'
  });
}])
.factory('categoriesFactory', function($http, AccessToken) {

	$http.defaults.headers.common.Authorization = "Bearer " + (AccessToken.get() != null ? AccessToken.get().access_token : "");

	var getAllCategoriesUrl = "http://localhost:8080/categories";
	
	var categoriesFactory = {};

	categoriesFactory.getAllCategories = function() {
		return $http.get(getAllCategoriesUrl);
	}

	return categoriesFactory;
})
.controller('CategoriesController', function($scope, UtilService, categoriesFactory) {

	var categoriesTable;

	init();

	$scope.reset = function() {
		$('#categories_table_processing').show();
		categoriesFactory.getAllCategories()
		.then(function(response) {
			initializeCategoriesTable(response.data.payload);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) {
			$scope.searchCriteria = "";
			$('#categories_table_processing').hide();
		});
	}

	function init() {
		$('#categories_table_processing').show();
		categoriesFactory.getAllCategories()
		.then(function(response) {
			initializeCategoriesTable(response.data.payload);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) {
			$('#categories_table_processing').hide();
		});
	}

	function initializeCategoriesTable(categories) {
		if(!$.fn.DataTable.isDataTable('#categories_table')) {
			categoriesTable = $('#categories_table').DataTable({
			data: categories,
			processing: true,
			filter: false,
			lengthChange: false,
			autoWidth: false,
			columns: [
				{"data":"id"},
				{"data":"name"},
				{"data":"remark"}],

				language: UtilService.getTableLanguageSettings()
			});
		} else {
			categoriesTable.clear().draw();
			categoriesTable.rows.add(categories);
   			categoriesTable.columns.adjust().draw();
		}
	}
});