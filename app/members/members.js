'use strict';

angular.module('eKlub.members', ['ngRoute', 'eKlub.groups'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/members', {
    templateUrl: 'members/members.html',
    controller: 'MembersController'
  });
}])

.factory('membersFactory', function($http) {

	var getAllMembersUrl = "http://localhost:8080/members";
	var getMembersUrl = "http://localhost:8080/members/search";
	var getMemberByIdUrl = "http://localhost:8080/members/id";
	var deleteMemberUrl = "";
	var saveMemberUrl = "http://localhost:8080/members";

	var membersFactory = {};

	membersFactory.getAllMembers = function () {
		return $http.get(getAllMembersUrl);
	};

	membersFactory.getMembers = function(searchCriteria) {
		var data = {
				"nameSurname": searchCriteria,
				"idCard": searchCriteria,
				"address": searchCriteria,
				"email": searchCriteria,
				"phone": searchCriteria
		};
		return $http({
			url: getMembersUrl,
		 	method: 'POST',
		 	data: data
		});
	}

	membersFactory.getMembersByGroup = function(groupId) {
		var data = {
				"group": groupId
		};
		return $http({
			url: getMembersUrl,
		 	method: 'POST',
		 	data: data
		});
	}

	membersFactory.saveMember = function(member) {
		return $http({
			url: saveMemberUrl,
			method: 'POST',
			data: member
		});
	}

	membersFactory.getMemberById = function(id) {
		var targetUrl = getMemberByIdUrl.replace("id", id);
		return $http.get(targetUrl);
	}

	return membersFactory;
})

.controller('MembersController', function($scope, membersFactory, groupsFactory) {

	var table;
	var paymentsTable;
	var attendanceTable;

	init();

	$scope.reset = function() {
		membersFactory.getAllMembers()
		.then(function(response) {
			$('#members_table_processing').show();
			table.clear().draw();
			table.rows.add(response.data.payload);
   			table.columns.adjust().draw();
		}, function(error) {
			alert("Error: " + error);
		}).finally(function (response) {
			$scope.searchCriteria = "";
			$('#members_table_processing').hide();
		});
	}

	$scope.searchMembers = function() {
		var searchCriteria = $scope.searchCriteria;
		membersFactory.getMembers(searchCriteria)
		.then(function(response) {
			$('#members_table_processing').show();
			table.clear().draw();
			table.rows.add(response.data.payload);
   			table.columns.adjust().draw();
		}, function(error) {
			alert("Error: " + JSON.stringify(error));
		}).finally(function (response) {
			$('#members_table_processing').hide();
		});
	}

	$scope.filterMembersByGroup = function(groupId) {
		membersFactory.getMembersByGroup(groupId)
		.then(function(response) {
			$('#members_table_processing').show();
			table.clear().draw();
			table.rows.add(response.data.payload);
   			table.columns.adjust().draw();
		}, function(error) {
			alert("Error: " + JSON.stringify(error));
		}).finally(function (response) {
			$('#members_table_processing').hide();
		});
	}

	$scope.createNewMember = function() {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
			$scope.memberDialog = { newMember: {}};
			$scope.memberDialog.newMember.group = response.data.payload[0];
			$scope.memberDialog.newMember.gender = 'M';
		}, function(error) {
			alert("Error: " + JSON.stringify(error));
		}).finally(function (response) {
			
		});
	}

	$scope.getMemberById = function(id) {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
			$scope.memberDialog = { editMember: {}};
			membersFactory.getMemberById(id)
			.then(function(response){
				// getAllGroups();
				$scope.memberDialog = { editMember: {}};
				// console.log(response.data.payload);
				$scope.memberDialog.editMember = response.data.payload;
				initializePaymentsTable(response.data.payload.payments);
				initializeAttendancesTable(response.data.payload.attendances);
			}, function(error) {
				alert("Error: " + JSON.stringify(error));
			}).finally(function(response) {

			});
		}, function(error) {
			alert("Error: " + JSON.stringify(error));
		}).finally(function (response) {
			
		});
	}

	$scope.saveMember = function() {
		if ($scope.newMemberForm.$valid) {
			var member = JSON.stringify($scope.memberDialog.newMember);
			console.log(JSON.stringify(member));
			membersFactory.saveMember(member)
			.then(function(response) {
				alert(JSON.stringify(response.data.payload));
				// exit dialog
			}, function(error) {
				alert("Error: " + JSON.stringify(error));
			}).finally(function(response) {
				// refresh table
			});
		} else {
			alert("Morate popuniti sva obavezna polja.");
		}
	}

	$scope.editMember = function() {

	}

	$scope.resetMemberDialog = function() {
		$scope.memberDialog.newMember = {};
		$scope.newMemberForm.$setPristine();
		$scope.newMemberForm.$setUntouched();
	}

	$scope.resetEditMemberDialog = function() {
		$scope.memberDialog.editMember = {};
		$scope.editMemberForm.$setPristine();
		$scope.editMemberForm.$setUntouched();
	}

	function init() {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
		}, function(error) {
			alert("Error: " + error)
		}).finally(function (response) {

		});
		membersFactory.getAllMembers()
		.then(function(response) {
			$('#members_table_processing').show();
			initializeMembersDataTable(response.data.payload);
		}, function(error) {
			alert("Error: " + error)
		}).finally(function (response) {
			$('#members_table_processing').hide();
		});

	};

	function initializeMembersDataTable(members) {
		table = $('#members_table').DataTable({
			data: members,
			processing: true,
			filter: false,
			autoWidth: false,
			columns: [
            { "data": "id" },
            { "data": "idCard" },
            { "data": "nameSurname" },
            { "data": "gender" },
            { "data": "email" },
            { "data": "address" },
            { "data": "phone" },
            { "data": "dateOfBirth" },
            { "data": "dateOfMembership" },
            { "data": "group.name", "defaultContent": "" },
            { "data": null, "render":function(data, type, row) {
            							return '<button data-toggle="modal" data-target="#edit_member_dialog" class="btn btn-default" onclick=\"angular.element(this).scope().getMemberById(\'' + data.id + '\')\" style="margin-right: 5%;"><i class="fa fa-search fa-fw"></i></button>'
            									+ '<button class="btn btn-default" onclick="alert(' + data.id + ');"><i class="fa fa-times fa-fw" style="color:red;"></i></button>';
            						}}],

            language: languageSettings
		});
	}

	function initializePaymentsTable(payments) {

		if(!$.fn.DataTable.isDataTable('#payments_table')) {
			paymentsTable = $('#payments_table').DataTable({
			data: payments,
			processing: true,
			filter: false,
			pageLength: 5,
			lengthChange: false,
			autoWidth: false,
			columns: [
				{"data":"id"},
				{"data":"fee.dateFrom"},
				{"data":"fee.dateTo"},
				{"data":"amount"},
				{"data":"dateOfPayment"}],

				language: languageSettings
			});
		} else {
			console.log(payments);
			paymentsTable.clear().draw();
			paymentsTable.rows.add(payments);
   			paymentsTable.columns.adjust().draw();
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
				{"data":"training.dateTime"},
				{"data":"training.durationMinutes"},
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
			    "sProcessing":   "Procesiranje u toku...",
			    "sLengthMenu":   "Prikaži _MENU_ elemenata",
			    "sZeroRecords":  "Nije pronađen nijedan rezultat",
			    "sInfo":         "Prikaz _START_ do _END_ od ukupno _TOTAL_ elemenata",
			    "sInfoEmpty":    "Prikaz 0 do 0 od ukupno 0 elemenata",
			    "sInfoFiltered": "(filtrirano od ukupno _MAX_ elemenata)",
			    "sInfoPostFix":  "",
			    "sSearch":       "Pretraga:",
			    "sUrl":          "",
			    "oPaginate": {
			        "sFirst":    "Početna",
			        "sPrevious": "Prethodna",
			        "sNext":     "Sledeća",
			        "sLast":     "Poslednja"
			    }
			};
});