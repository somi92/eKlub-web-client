'use strict';

// Declare app level module which depends on views, and components
angular.module('eKlub', [
  'ngRoute',
  'eKlub.dashboard',
  'eKlub.members',
  'eKlub.groups',
  'eKlub.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]).

directive('datepicker', function(){
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function ($scope, element, attrs, controller) {
            var updateModel, onblur;

            if (controller !== null) {

                updateModel = function () {
                	if (element.data("DateTimePicker").minViewMode === element.data("DateTimePicker").viewMode) {
	                    element.data("DateTimePicker").hide();
                        element.blur();
                	}
                };

                onblur = function () {
                    var date = element.datetimepicker().data("DateTimePicker").date().format('DD.MM.YYYY.');
                    return $scope.$apply(function () {
                        return controller.$setViewValue(date);
                    });
                };

                controller.$render = function () {
                    var date = controller.$viewValue;
                    if (angular.isDefined(date) && date != null && moment.isMoment(date)) {
            			element.datetimepicker().data("DateTimePicker").setDate(date);
                    } else if (angular.isDefined(date)) {
                        throw new Error('ng-model value must be a Moment - currently it is a ' + typeof date + '.');
                    }
                    return controller.$viewValue;
                };
            }
            return attrs.$observe('datepicker', function (value) {
                var options;
                options = { locale: 'sr', format: 'DD.MM.YYYY.' }; //<--- insert your own defaults here!
                if (angular.isObject(value)) {
                    options = value;
                }
                if (typeof (value) === "string" && value.length > 0) {
                    options = angular.fromJson(value);
                }
                return element.datetimepicker(options).on('change.dp', updateModel).on('blur', onblur);
            });
        }
    };
});
