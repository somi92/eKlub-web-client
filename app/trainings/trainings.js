'use strict';

angular.module('eKlub.trainings', ['ngRoute', 'eKlub.groups'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/trainings', {
		templateUrl: 'trainings/trainings.html',
		controller: 'TrainingsController'
	});
}])
.factory('trainingsFactory', function($http, AccessToken) {

	$http.defaults.headers.common.Authorization = "Bearer " + (AccessToken.get() != null ? AccessToken.get().access_token : "");

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
			"durationMinutes": searchCriteria,
			"description": searchCriteria
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
.controller('TrainingsController', function($scope, UtilService, trainingsFactory, groupsFactory) {

	var trainingsTable;
	var attendanceTable;

	init();

	function init() {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) {

		});
		$('#trainings_table_processing').show();
		trainingsFactory.getTrainingsEmptySearch()
		.then(function(response) {
			initializeTrainingsTable(response.data.payload);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
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
			UtilService.handleErrorResponse(error.data);
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
			UtilService.notifyError("Sistem ne može da pronađe treninge po zadatim vrednostima");
			// UtilService.handleErrorResponse(error.data);
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
			UtilService.notifyError("Sistem ne može da pronađe treninge po zadatim vrednostima");
			// UtilService.handleErrorResponse(error.data);
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
			$("#training_details_dialog").modal('hide');
			UtilService.notifyError("Sistem ne može da prikaže podatke o izabranom treningu");
			// UtilService.handleErrorResponse(error.data);
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
				{ "data": "description" },
				{ "data": null, "render":function(data, type, row) {
					return '<button data-toggle="modal" data-target="#training_details_dialog" class="btn btn-default" onclick=\"angular.element(this).scope().getTrainingById(\'' + data.id + '\')\" style="margin-right: 10%;"><i class="fa fa-folder-open fa-fw"></i></button>';
				}}],

				language: UtilService.getTableLanguageSettings()
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

				language: UtilService.getTableLanguageSettings()
			});
		} else {
			console.log(attendances);
			attendanceTable.clear().draw();
			attendanceTable.rows.add(attendances);
			attendanceTable.columns.adjust().draw();
		}
	}
});