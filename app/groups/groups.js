'use strict';

angular.module('eKlub.groups', ['ngRoute', 'eKlub.categories'])

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

	groupsFactory.saveGroup = function(group) {
		return $http({
			url: saveMemberUrl,
			method: 'POST',
			data: group
		});
	}

	groupsFactory.getAllGroups = function() {
		return $http.get(getAllGroupsUrl);
	}

	return groupsFactory;
})

.controller('GroupsController', function($scope, UtilService, groupsFactory, categoriesFactory) {

	var groupsTable;

	init();

	$scope.reset = function() {
		$('#groups_table_processing').show();
		groupsFactory.getAllGroups()
		.then(function(response) {
			initializeGroupsTable(response.data.payload);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) {
			$scope.searchCriteria = "";
			$('#groups_table_processing').hide();
		});
	}

	$scope.createNewGroup = function() {
		categoriesFactory.getAllCategories()
		.then(function(response) {
			$scope.categories = response.data.payload;
			$scope.groupDialog = { newGroup: {}};
			$scope.groupDialog.newGroup.category = response.data.payload[0];
		}, function(error) {
			$("#group_dialog").modal('hide');
			UtilService.notifyError("Sistem ne može da prikaže ekran za kreiranje nove grupe");
			// UtilService.handleErrorResponse(error.data);
		}).finally(function (response) {
			
		});
	}

	$scope.saveGroup = function() {
		if ($scope.newGroupForm.$valid) {
			var group = JSON.stringify($scope.groupDialog.newGroup);
			console.log(JSON.stringify(group));
			groupsFactory.saveGroup(group)
			.then(function(response) {
				if(response.data.status == "200") {
					UtilService.notifyInfo("Sistem je uspešno zapamtio novu grupu");
				} else {
					UtilService.notifyInfo(response.data.message);
				}
				$('#group_dialog').modal('hide');
			}, function(error) {
				UtilService.notifyError("Sistem ne može da zapamti novu grupu");
				// UtilService.handleErrorResponse(error.data);
			}).finally(function(response) {
				$scope.reset();
			});
		} else {
			alert("Morate popuniti sva obavezna polja.");
		}
	}

	$scope.resetGroupDialog = function() {
		$scope.groupDialog.newGroup = {};
		$scope.newGroupForm.$setPristine();
		$scope.newGroupForm.$setUntouched();
	}

	function init() {
		$('#groups_table_processing').show();
		groupsFactory.getAllGroups()
		.then(function(response) {
			initializeGroupsTable(response.data.payload);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
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

				language: UtilService.getTableLanguageSettings()
			});
		} else {
			console.log(groups);
			groupsTable.clear().draw();
			groupsTable.rows.add(groups);
   			groupsTable.columns.adjust().draw();
		}
	}
});