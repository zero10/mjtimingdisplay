'use strict';

angular.module('myApp', [])
.filter('milliseconds', function() {
  return function(value) {
    var time = parseFloat(value) / 1000;
    return time.toFixed(3);
  };
})
.controller('appController', function ($scope, $http) {
  // on page load make the http request to get score data
  // process it - times should maybe be total in ms, we can use a formatter on them later
  // parse the query string to get raw/pax/runs, on runs use a hash fragment for one car only, otherwise full list
  // helper buttons to strip the hash fragment and show all runs
  
  // index.html should be preparing a bootstrap grid or something to put the data in instead of just a html table
  // keep in mind it needs to keep each row grouped together when on wide and narrow displays
  // we could collapse or remove some columns when viewed vertically, perhaps car could be removed for this view
  $scope.text = "Hello world!";
  $scope.data = [
    { driver:"Bob2", number: 5, time: 99050},
    { driver:"Bob", number: 1, time: 91050},
    { driver:"Jim", number: 99, time: 100358},
    { driver:"Frank", number: 51, time: 30123}
  ];
  $scope.hasData = function() {
    return !_.isUndefined($scope.data) && $scope.data.length > 0;
  };
});