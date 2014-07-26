'use strict';

angular.module('myApp', [])
.filter('formatruntime', function() {
  // might be a number or DNS?
  return function(value) {
    var time = parseFloat(value) / 1000;
    return time.toFixed(3);
  };
})
.controller('appController', function ($scope, $http, $location) {
  
  var padLeft = function(inString) {
    var pad = "00";
    var str = "";
    if (!_.isUndefined(inString)) { str +=  inString; }
    return pad.substring(0, pad.length - str.length) + str;
  };
  // need function to filter to valid runs
  // check for DNF/RRN 
  var mapRunsToDriver = function(driver, runData) {
    var fastestRun1 = _.first(_.sortBy(_.filter(runData[driver.number], function(run) { return run.day === 1;}), function(run) { return run.time; }));
    var fastestRun2 = _.first(_.sortBy(_.filter(runData[driver.number], function(run) { return run.day === 2;}), function(run) { return run.time; }));
    var ftd1 = fastestRun1 ? fastestRun1.time * 1000 : 0;
    var ftd2 = fastestRun2 ? fastestRun2.time * 1000 : 0;
    return {
      driver: driver.name,
      number: driver.number,
      class: driver.class,
      car: driver.car,
      member: driver.member,
      rookie: driver.rookie,
      ftd1: ftd1,
      ftd2: ftd2,
      time: ftd1 + ftd2
    };
  };
  
  $http({method: 'GET', url: '/scores/scorelist'})
    .success(function(data, status, headers, config) {
    $scope.dates = _.sortBy(data, function(date) { return date.Prefix; });
    var d = new Date();
    var dateString = d.getFullYear() + '_' + padLeft(d.getMonth() + 1) + '_' + padLeft(d.getDate());
    _.each($scope.dates, function(date) {
      if (dateString === date.Prefix) {
        $scope.selectedDate = date;
      }
    });
    // try to select today, if no scores for today just take the last one
    if (_.isUndefined($scope.selectedDate)) {
      $scope.selectedDate = _.last($scope.dates);
    }
    $scope.dateSelected(); 
  });
  
  $scope.mode = 'PAX';
  $scope.hasData = function() {
    return !_.isUndefined($scope.data) && $scope.data.length > 0;
  };
  $scope.dateSelected = function() {
    if (!_.isUndefined($scope.selectedDate)) {
      $http({method: 'GET', url: '/scores/scoresbyprefix?prefix='+$scope.selectedDate.Prefix})
      .success(function(data, status, headers, config) {
        // turn the runs data into something we can quickly index into
        var processedRuns = {};
        _.each(data.Runs, function(run) {
          if (_.isUndefined(processedRuns[run.number])) {
            processedRuns[run.number] = [];
          }
          processedRuns[run.number].push(run);
        });
        // add a layer of filtering - only include drivers with runs
        $scope.data = _.map(data.Drivers, function(driver) { return mapRunsToDriver(driver, processedRuns); });
      });
    }
  };
});