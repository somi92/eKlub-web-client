'use strict';

angular.module('eKlub.fees', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fees', {
    templateUrl: 'fees/fees.html',
    controller: 'FeesController'
  });
}])

.factory('feesFactory', function($http) {

	var getAllMembershipFeesUrl = "http://localhost:8080/fees";
	var savePaymentsUrl = "http://localhost:8080/payments"

	var feesFactory = {};

	feesFactory.getAllMembershipFees = function() {
		return $http.get(getAllMembershipFeesUrl);
	};

	feesFactory.savePayment = function(payment) {
		var data = [payment];
		return $http({
			url: savePaymentsUrl,
		 	method: 'POST',
		 	data: data
		});
	}

	return feesFactory;

})

.controller('FeesController', function($scope, membersFactory, groupsFactory) {



});