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
	var getMemberByIdUrl = "";
	var deleteMemberUrl = "";
	var saveMemberUrl = "";

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
		var req = {
			url: getMembersUrl,
		 	method: 'POST',
		 	data: data
		};

		return $http({
			url: getMembersUrl,
		 	method: 'POST',
		 	data: data
		});
	}

	return membersFactory;
})

.controller('MembersController', function($scope, membersFactory, groupsFactory) {

	var table;

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

	$scope.getAllGroups = function() {
		groupsFactory.getAllGroups()
		.then(function(response) {
			$scope.groups = response.data.payload;
			$scope.newMember = {};
			$scope.newMember.group = response.data.payload[0].id;
			alert(JSON.stringify($scope.newMember.group));
		}, function(error) {
			alert("Error: " + JSON.stringify(error));
		}).finally(function (response) {

		});
	}

	$scope.saveMember = function() {
		alert(JSON.stringify($scope.newMember));
	}

	$scope.resetMemberDialog = function() {
		$scope.newMember = {};
	}

	function init() {
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
            { "data": "group.id", "defaultContent": "" }],

            language: {
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
			}
		});
	}

});