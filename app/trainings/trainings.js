'use strict';

angular.module('eKlub.trainings', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/trainings', {
    templateUrl: 'trainings/trainings.html',
    controller: 'TrainingsController'
  });
}])
.factory('trainingsFactory', function($http){

	var getTrainingsUrl = "http://localhost:8080/trainings/search";
	
	var trainingsFactory = {};
})
.controller('TrainingsController', function($scope) {

	var trainingsTable;

	init();

});