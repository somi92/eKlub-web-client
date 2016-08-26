'use strict';

angular.module('eKlub.members', ['ngRoute', 'eKlub.groups', 'eKlub.fees'])

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

.controller('MembersController', function($scope, UtilService, membersFactory, groupsFactory, feesFactory) {

	var table;
	var paymentsTable;
	var payments;
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
			UtilService.handleErrorResponse(error.data);
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
			UtilService.notifyError("Sistem ne može da pronađe članove po zadatim vrednostima");
			// UtilService.handleErrorResponse(error.data);
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
			UtilService.notifyError("Sistem ne može da pronađe članove po zadatim vrednostima");
			// UtilService.handleErrorResponse(error.data);
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
			$("#member_dialog").modal('hide');
			UtilService.notifyError("Sistem ne može da prikaže ekran za kreiranje novog člana");
			// UtilService.handleErrorResponse(error.data);
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
				payments = response.data.payload.payments;
				initializePaymentsTable(payments);
				initializeAttendancesTable(response.data.payload.attendances);
			}, function(error) {
				UtilService.notifyError("Sistem ne može da prikaže podatke za izabranog člana");
				// UtilService.handleErrorResponse(error.data);
			}).finally(function(response) {

			});
		}, function(error) {
			$("#edit_member_dialog").modal('hide');
			UtilService.notifyError("Sistem ne može da prikaže podatke za izabranog člana");
			// UtilService.handleErrorResponse(error.data);
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
					UtilService.notifyInfo("Sistem je uspešno zapamtio novog člana");
				} else {
					UtilService.notifyInfo(response.data.message);
				}
				$('#member_dialog').modal('hide');
			}, function(error) {
				UtilService.notifyError("Sistem ne može da zapamti novog člana");
				// UtilService.handleErrorResponse(error.data);
			}).finally(function(response) {
				$scope.reset();
			});
		} else {
			UtilService.notifyInfo("Morate popuniti sva obavezna polja");
		}
	}

	$scope.editMember = function() {
		if ($scope.editMemberForm.$valid) {
			var member = JSON.stringify($scope.memberDialog.editMember);
			console.log(JSON.stringify(member));
			membersFactory.saveMember(member)
			.then(function(response) {
				if(response.data.status == "200") {
					UtilService.notifyInfo("Sistem je uspešno zapamtio izmene");
				} else {
					UtilService.notifyInfo(response.data.message);
				}
				$('#edit_member_dialog').modal('hide');
			}, function(error) {
				UtilService.notifyError("Sistem ne može da zapamti izmene člana");
				// UtilService.handleErrorResponse(error.data);
			}).finally(function(response) {
				$scope.reset();
			});
		} else {
			UtilService.notifyInfo("Morate popuniti sva obavezna polja");
		}
	}

	$scope.deleteMember = function () {
		var memberId = $scope.deleteMember.id;
		membersFactory.deleteMemberById(memberId)
		.then(function(response) {
			if(response.data.status == "200") {
				UtilService.notifyInfo("Sistem je uspešno izbrisao člana");
			} else {
				UtilService.notifyInfo(response.data.message);
			}
			$('#delete_member_dialog').modal('hide');
		}, function(error) {
			UtilService.notifyError("Sistem ne može da obriše izabranog člana");
			// UtilService.handleErrorResponse(error.data);
		}).finally(function(response) {
			$scope.reset();
		});
	}

	$scope.getPayment = function(id) {
		feesFactory.getAllMembershipFees()
		.then(function(response){
			response.data.payload.forEach(function(item) {
				item["display"] = item.dateFrom + " - " + item.dateTo;
			});
			$scope.fees = response.data.payload;
			$scope.paymentDialog = { payment: {}};
			$scope.paymentDialog.payment = payments.filter(e => e.id == id)[0];
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
		}).finally(function() {

		});
	}	

	$scope.savePayment = function() {
		var payment = $scope.paymentDialog.payment;
		payment["memberId"] = $scope.memberDialog.editMember.id;
		console.log(JSON.stringify(payment));
		feesFactory.savePayment(payment)
		.then(function(response) {
			if(response.data.status == "200") {
				UtilService.notifyInfo("Sistem je uspešno zapamtio novu uplatu članarine");
			} else {
				UtilService.notifyInfo(response.data.message);
			}
			$('#payment_dialog').modal('hide');
			$scope.getMemberById($scope.memberDialog.editMember.id);
		}, function(error) {
			UtilService.notifyError("Sistem ne može da zapamti novu uplatu članarine");
			// UtilService.handleErrorResponse(error.data);
		}).finally(function(response) {

		});
	}

	$scope.resetPaymentDialog = function() {
		feesFactory.getAllMembershipFees()
		.then(function(response){
			response.data.payload.forEach(function(item) {
				item["display"] = item.dateFrom + " - " + item.dateTo;
			});
			$scope.fees = response.data.payload;
			$scope.paymentDialog = { payment: {}};
			$scope.paymentDialog.payment.dateOfPayment = new Date().toJSON().slice(0,10);
			$scope.paymentDialog.payment.fee = response.data.payload[0];
		}, function(error) {
			$("#payment_dialog").modal('hide');
			UtilService.notifyError("Sistem ne može da prikaže ekran za evidentiranje nove uplate članarine");
			// UtilService.handleErrorResponse(error.data);
		}).finally(function() {
			
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
			UtilService.handleErrorResponse(error.data);
		}).finally(function (response) {

		});
		$('#members_table_processing').show();
		membersFactory.getAllMembers()
		.then(function(response) {
			initializeMembersDataTable(response.data.payload);
		}, function(error) {
			UtilService.handleErrorResponse(error.data);
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

			language: UtilService.getTableLanguageSettings()
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
				{"data":"dateOfPayment"},
				{"data":null, "render": function(data, type, row) {
					return '<button data-toggle="modal" data-target="#payment_dialog" class="btn btn-default" onclick=\"angular.element(this).scope().getPayment(' + data.id + ')\" style="margin-right: 5%;"><i class="fa fa-folder-open fa-fw"></i></button>';
				}}],

				language: UtilService.getTableLanguageSettings()
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