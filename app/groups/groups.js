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

	groupsFactory.getAllGroups = function() {
		return $http.get(getAllGroupsUrl);
	}

	return groupsFactory;
})

.controller('GroupsController', [function() {

}]);