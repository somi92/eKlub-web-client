'use strict';

angular.module('eKlub.groups', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/groups', {
    templateUrl: 'groups/groups.html',
    controller: 'GroupsController'
  });
}])

.factory('groupsFactory', function($http){
	
	var getAllGroupsUrl = "http://localhost:8080/groups";
	var saveMemberUrl = "http://localhost:8080/groups";

	var groupsFactory = {};

	groupsFactory.saveGroup = function() {

	}

	groupsFactory.getAllGroups = function() {
		return $http.get(getAllGroupsUrl);
	}

	return groupsFactory;
})

.controller('GroupsController', function($scope, groupsFactory) {

	var groupsTable;

	init();

	$scope.reset = function() {
		$('#groups_table_processing').show();
		groupsFactory.getAllGroups()
		.then(function(response) {
			initializeGroupsTable(response.data.payload);
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$scope.searchCriteria = "";
			$('#groups_table_processing').hide();
		});
	}

	function init() {
		$('#groups_table_processing').show();
		groupsFactory.getAllGroups()
		.then(function(response) {
			initializeGroupsTable(response.data.payload);
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$('#groups_table_processing').hide();
		});
	}

	function initializeGroupsTable(groups) {
		if(!$.fn.DataTable.isDataTable('#groups_table')) {
			groupsTable = $('#groups_table').DataTable({
			data: groups,
			processing: true,
			filter: false,
			lengthChange: false,
			autoWidth: false,
			columns: [
				{"data":"id"},
				{"data":"name"},
				{"data":"category.name"},
				{"data":"remark"}],

				language: languageSettings
			});
		} else {
			console.log(groups);
			groupsTable.clear().draw();
			groupsTable.rows.add(groups);
   			groupsTable.columns.adjust().draw();
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