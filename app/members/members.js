'use strict';

angular.module('eKlub.members', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/members', {
    templateUrl: 'members/members.html',
    controller: 'MembersController'
  });
}])

.factory('membersFactory', function($http) {

	var getAllMembersUrl = "http://localhost:8080/members";
	var getMembersUrl = "";
	var getMemberByIdUrl = "";
	var deleteMemberUrl = "";
	var saveMemberUrl = "";

	var membersFactory = {};

	membersFactory.getAllMembers = function () {
		return $http.get(getAllMembersUrl);
	};

	return membersFactory;
})

.controller('MembersController', function($scope, membersFactory) {


	init();

	function init() {
		membersFactory.getAllMembers()
		.then(function(response) {
			initializeMembersDataTable(response.data.payload);
		}, function(error) {
			alert("Error: " + error)
		}).finally(function (response) {
			
		});

	};

	function initializeMembersDataTable(members) {
		$('#members_table').dataTable({
			data: members,
			processing: true,
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