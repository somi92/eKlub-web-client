'use strict';

angular.module('eKlub.trainings', ['ngRoute', 'eKlub.groups'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/trainings', {
		templateUrl: 'trainings/trainings.html',
		controller: 'TrainingsController'
	});
}])
.factory('trainingsFactory', function($http){

	var getTrainingsUrl = "http://localhost:8080/trainings/search";
	var getTrainingByIdUrl = "http://localhost:8080/trainings/id";
	
	var trainingsFactory = {};

	trainingsFactory.getTrainingsEmptySearch = function() {
		var data = {};
		return $http({
			url: getTrainingsUrl,
			method: 'POST',
			data: data
		});
	}

	trainingsFactory.getTrainings = function(searchCriteria) {
		var data = {
			"dateTime": searchCriteria,
			"durationMinutes": searchCriteria
		};
		return $http({
			url: getTrainingsUrl,
			method: 'POST',
			data: data
		});
	}

	trainingsFactory.getTrainingById = function(id) {
		var targetUrl = getTrainingByIdUrl.replace("id", id);
		return $http.get(targetUrl);
	}

	trainingsFactory.getTrainingsByGroup = function(groupId) {
		var data = {
			"group": groupId
		};
		return $http({
			url: getTrainingsUrl,
			method: 'POST',
			data: data
		});
	}

	return trainingsFactory;
})
.controller('TrainingsController', function($scope, trainingsFactory, groupsFactory) {

	var trainingsTable;
	var attendanceTable;

	init();

	function init() {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {

		});
		$('#trainings_table_processing').show();
		trainingsFactory.getTrainingsEmptySearch()
		.then(function(response) {
			initializeTrainingsTable(response.data.payload);
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$('#trainings_table_processing').hide();
		});
	}

	$scope.reset = function() {
		$('#trainings_table_processing').show();
		trainingsFactory.getTrainingsEmptySearch()
		.then(function(response) {
			trainingsTable.clear().draw();
			trainingsTable.rows.add(response.data.payload);
			trainingsTable.columns.adjust().draw();
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$scope.searchCriteria = "";
			$('#trainings_table_processing').hide();
		});
	}

	$scope.searchTrainings = function() {
		$('#trainings_table_processing').show();
		var searchCriteria = $scope.searchCriteria;
		trainingsFactory.getTrainings(searchCriteria)
		.then(function(response) {
			trainingsTable.clear().draw();
			trainingsTable.rows.add(response.data.payload);
			trainingsTable.columns.adjust().draw();
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$('#trainings_table_processing').hide();
		});
	}

	$scope.filterTrainingsByGroup = function(groupId) {
		$('#trainings_table_processing').show();
		trainingsFactory.getTrainingsByGroup(groupId)
		.then(function(response) {
			trainingsTable.clear().draw();
			trainingsTable.rows.add(response.data.payload);
			trainingsTable.columns.adjust().draw();
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$('#trainings_table_processing').hide();
		});
	}

	$scope.getTrainingById = function(id) {
		trainingsFactory.getTrainingById(id)
		.then(function(response){
			$scope.trainingDialog = { training: {}};
			$scope.trainingDialog.training = response.data.payload;
			initializeAttendancesTable(response.data.payload.attendances);
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function(response) {

		});
	}

	function initializeTrainingsTable(trainings) {
		if(!$.fn.DataTable.isDataTable('#trainings_table')) {
			trainingsTable = $('#trainings_table').DataTable({
				data: trainings,
				processing: true,
				filter: false,
				lengthChange: false,
				autoWidth: false,
				columns: [
				{"data":"id"},
				{"data":"dateTime"},
				{"data":"durationMinutes"},
				{ "data": "group.name", "defaultContent": "" },
				{ "data": null, "render":function(data, type, row) {
					return '<button data-toggle="modal" data-target="#training_details_dialog" class="btn btn-default" onclick=\"angular.element(this).scope().getTrainingById(\'' + data.id + '\')\" style="margin-right: 10%;"><i class="fa fa-folder-open fa-fw"></i></button>';
				}}],

				language: languageSettings
			});
		} else {
			trainingsTable.clear().draw();
			trainingsTable.rows.add(trainings);
			trainingsTable.columns.adjust().draw();
		}
	}

	function initializeAttendancesTable(attendances) {
		if(!$.fn.DataTable.isDataTable('#attendances_table')) {
			attendanceTable = $('#attendances_table').DataTable({
			data: attendances,
			processing: true,
			filter: false,
			pageLength: 5,
			lengthChange: false,
			autoWidth: false,
			columns: [
				{"data":"id"},
				{"data":"member.idCard"},
				{"data":"member.nameSurname"},
				{"data":null, "render":function(data, type, row) {
					if(data.isAttendant == true)
						return "Da";
					else
						return "Ne";
				}},
				{"data":"lateMin"}],

				language: languageSettings
			});
		} else {
			console.log(attendances);
			attendanceTable.clear().draw();
			attendanceTable.rows.add(attendances);
   			attendanceTable.columns.adjust().draw();
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