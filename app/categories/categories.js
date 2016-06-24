'use strict';

angular.module('eKlub.categories', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/categories', {
    templateUrl: 'categories/categories.html',
    controller: 'CategoriesController'
  });
}])
.factory('categoriesFactory', function($http){

	var getAllCategoriesUrl = "http://localhost:8080/categories";
	
	var categoriesFactory = {};

	categoriesFactory.getAllCategories = function() {
		return $http.get(getAllCategoriesUrl);
	}

	return categoriesFactory;
})
.controller('CategoriesController', function($scope, categoriesFactory) {

	var categoriesTable;

	init();

	$scope.reset = function() {
		$('#categories_table_processing').show();
		categoriesFactory.getAllCategories()
		.then(function(response) {
			initializeCategoriesTable(response.data.payload);
		}, function(error) {
			handleErrorResponse(error.data);
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
			handleErrorResponse(error.data);
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

				language: languageSettings
			});
		} else {
			categoriesTable.clear().draw();
			categoriesTable.rows.add(categories);
   			categoriesTable.columns.adjust().draw();
		}
	}

	var languageSettings = {
		"sProcessing": "Procesiranje u toku...",
		"sLengthMenu": "Prikaži _MENU_ elemenata",
		"sZeroRecords": "Nije pronađen nijedan rezultat",
		"sInfo": "Prikaz _START_ do _END_ od ukupno _TOTAL_ elemenata",
		"sInfoEmpty": "Prikaz 0 do 0 od ukupno 0 elemenata",
	    "sInfoFiltered": "(filtrirano od ukupno _MAX_ elemenata)",
		"sInfoPostFix":  "",
		"sSearch": "Pretraga:",
		"sUrl": "",
		"oPaginate": {
		    "sFirst":    "Početna",
		    "sPrevious": "Prethodna",
		    "sNext":     "Sledeća",
		    "sLast":     "Poslednja"
		}
	};

	function handleErrorResponse(errorContainer) {
		var message = "";
		var status = errorContainer.status;
		switch(status) {
			case "400":
				message = "Greška. Zahtev je nije validan.";
				break;
			case "404":
				message = "Sistem nije pronašao resurse koje tražite.";
				break;
			case "500":
				message = "Greška na serveru.";
				break;
			default:
				message = errorContainer.message;
		}
		console.log(errorContainer);
		alert(message);
	}

});