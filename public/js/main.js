'use strict';

angular.module('myApp', [])
.filter('milliseconds', function() {
  return function(value) {
    var time = parseFloat(value) / 1000;
    return time.toFixed(3);
  };
})
.filter('boolformatter', function() {
  return function(value) {
    if (value) return 'Yes';
    return 'No';
  };
})
.controller('appController', function ($scope, $http) {
  
  $http({method: 'GET', url: '/scores/scorelist'})
    .success(function(data, status, headers, config) {
    $scope.dates = _.map(data, function(date) { return {date: date.Prefix, prefix: date.Prefix}; });
    $scope.selectedDate = _.last($scope.dates);
    $scope.dateSelected(); 
  });
  
  $scope.text = "Hello world!";
  //todo: get the mode from the URL - empty = PAX?
  $scope.mode = 'PAX';
  $scope.data = [
    { driver:"Bob2", number: 5, time: 99050, class: 'STF', car:'Some death trap',member:true,rookie:false},
    { driver:"Bob", number: 1, time: 91050, class:'SSM', car:'Another death trap',member:false,rookie:true},
    { driver:"Jim", number: 99, time: 100358, class:'BSP', car:'Cheater-mobile',member:true,rookie:true},
    { driver:"Frank", number: 51, time: 30123, class:'AM', car:'Cheater killer', member:false,rookie:false}
  ];
  $scope.hasData = function() {
    return !_.isUndefined($scope.data) && $scope.data.length > 0;
  };
  $scope.dateSelected = function() {
    if (!_.isUndefined($scope.selectedDate)) {
      $http({method: 'GET', url: '/scores/scoresbyprefix?prefix='+$scope.selectedDate.prefix})
      .success(function(data, status, headers, config) {
        
      });
    }
  };
});