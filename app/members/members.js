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
	var deleteMemberUrl = "http://localhost:8080/members/id";
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

	membersFactory.deleteMemberById = function(id) {
		var targetUrl = deleteMemberUrl.replace("id", id);
		return $http.delete(targetUrl);
	}

	return membersFactory;
})

.controller('MembersController', function($scope, membersFactory, groupsFactory) {

	var table;
	var paymentsTable;
	var attendanceTable;

	init();

	$scope.reset = function() {
		$('#members_table_processing').show();
		membersFactory.getAllMembers()
		.then(function(response) {
			table.clear().draw();
			table.rows.add(response.data.payload);
   			table.columns.adjust().draw();
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$scope.searchCriteria = "";
			$('#members_table_processing').hide();
		});
	}

	$scope.searchMembers = function() {
		$('#members_table_processing').show();
		var searchCriteria = $scope.searchCriteria;
		membersFactory.getMembers(searchCriteria)
		.then(function(response) {
			table.clear().draw();
			table.rows.add(response.data.payload);
   			table.columns.adjust().draw();
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			$('#members_table_processing').hide();
		});
	}

	$scope.filterMembersByGroup = function(groupId) {
		$('#members_table_processing').show();
		membersFactory.getMembersByGroup(groupId)
		.then(function(response) {
			table.clear().draw();
			table.rows.add(response.data.payload);
   			table.columns.adjust().draw();
		}, function(error) {
			handleErrorResponse(error.data);
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
			handleErrorResponse(error.data);
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
				$scope.memberDialog = { editMember: {}};
				$scope.memberDialog.editMember = response.data.payload;
				initializePaymentsTable(response.data.payload.payments);
				initializeAttendancesTable(response.data.payload.attendances);
			}, function(error) {
				handleErrorResponse(error.data);
			}).finally(function(response) {

			});
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {
			
		});
	}

	$scope.saveMember = function() {
		if ($scope.newMemberForm.$valid) {
			var member = JSON.stringify($scope.memberDialog.newMember);
			console.log(JSON.stringify(member));
			membersFactory.saveMember(member)
			.then(function(response) {
				if(response.data.status == "200") {
					alert("Član je sačuvan.");
				} else {
					alert(response.data.message);
				}
				$('#member_dialog').modal('hide');
			}, function(error) {
				handleErrorResponse(error.data);
			}).finally(function(response) {
				$scope.reset();
			});
		} else {
			alert("Morate popuniti sva obavezna polja.");
		}
	}

	$scope.editMember = function() {
		if ($scope.editMemberForm.$valid) {
			var member = JSON.stringify($scope.memberDialog.editMember);
			console.log(JSON.stringify(member));
			membersFactory.saveMember(member)
			.then(function(response) {
				if(response.data.status == "200") {
					alert("Član je sačuvan.");
				} else {
					alert(response.data.message);
				}
				$('#edit_member_dialog').modal('hide');
			}, function(error) {
				handleErrorResponse(error.data);
			}).finally(function(response) {
				$scope.reset();
			});
		} else {
			alert("Morate popuniti sva obavezna polja.");
		}
	}

	$scope.deleteMember = function () {
		var memberId = $scope.deleteMember.id;
		membersFactory.deleteMemberById(memberId)
		.then(function(response) {
			if(response.data.status == "200") {
				alert("Član je obrisan.");
			} else {
				alert(response.data.message);
			}
			$('#delete_member_dialog').modal('hide');
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function(response) {
			$scope.reset();
		});
	}

	$scope.setUpMemberForDeletion = function(memberId, memberName) {
		$scope.deleteMember.id = memberId;
		$('#delete_message').html(memberId + " - " + memberName);
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

	$scope.resetMemberForDeletion = function() {
		$scope.deleteMember.id = {};
	}

	function init() {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
		}, function(error) {
			handleErrorResponse(error.data);
		}).finally(function (response) {

		});
		$('#members_table_processing').show();
		membersFactory.getAllMembers()
		.then(function(response) {
			initializeMembersDataTable(response.data.payload);
		}, function(error) {
			handleErrorResponse(error.data);
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
            							return '<button data-toggle="modal" data-target="#edit_member_dialog" class="btn btn-default" onclick=\"angular.element(this).scope().getMemberById(\'' + data.id + '\')\" style="margin-right: 5%;"><i class="fa fa-folder-open fa-fw"></i></button>'
            									+ '<button onclick="angular.element(this).scope().setUpMemberForDeletion(' + data.id + ', \'' + data.nameSurname + '\')" class="btn btn-default" data-toggle="modal" data-target="#delete_member_dialog"><i class="fa fa-times fa-fw" style="color:red;"></i></button>';
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