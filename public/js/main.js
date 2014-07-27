'use strict';
// pretty much stolen wholesale from jQuery, except we're using underscore's isArray method instead of theirs
var isNumeric = function( obj ) {
  return !_.isArray( obj ) && obj - parseFloat( obj ) >= 0;
};

angular.module('myApp', [])
.filter('formatruntime', function() {
  // might be a number or DNS?
  return function(value) {
    if (!isNumeric(value)) { return value; }
    var time = parseFloat(value) / 1000;
    return time.toFixed(3);
  };
})
.controller('appController', function ($scope, $http, $location, $q) {
  $scope.mode = 'PAX';
  $scope.loading = true;
  $scope.paxCones = false;
  $scope.paxValues = {};
  
  var findPax = function(carClass) {
    if (_.isUndefined($scope.paxValues[carClass])) {
      return 1.000;
    }
    return $scope.paxValues[carClass].pax;
  };
  var padLeft = function(inString) {
    var pad = "00";
    var str = "";
    if (!_.isUndefined(inString)) { str += inString; }
    return pad.substring(0, pad.length - str.length) + str;
  };
  var validRuns = function(run, day) {
    return ((_.isUndefined(run.penalty) || '' === run.penalty || isNumeric(run.penalty)) && 
      day === run.day);
  };
  // need function to filter to valid runs
  // check for DNF/RRN 
  var getFtdForDay = function(runs, day) {
    return _.chain(runs)
      .filter(function(run) { return validRuns(run, day);})
      .map(function(run) {
        var penalty = run.penalty || 0;
        return (run.time*1000) + (penalty*2000); 
      })
      .sort()
      .first()
      .value(); 
  };
  var getTime = function(times) {
    var time = 0;
    var hasTime = true;
    _.each($scope.days, function(day) {
      var dayTime = times[day];
      if (_.isUndefined(dayTime)) {
        hasTime = false;;
      } else {
        time += dayTime;
      }
    });
    if (hasTime) {
      return time;
    } else {
      return 'DNS';
    }
  };
  var mapRunsToDriver = function(driver, runData) {
    var times = _.object(_.map($scope.days, function(day) { return [day, getFtdForDay(runData[driver.number], day)];}));
    var driver = {
      driver: driver.driver,
      number: driver.number,
      class: driver.class,
      car: driver.car,
      member: driver.member,
      rookie: driver.rookie,
      runs: runData[driver.number],
      rawTime: getTime(times),
      paxTime: getTime(times) * findPax(driver.class),
      pax: findPax(driver.class)
    };
    return driver;
  };
  
  var getPrefixes = $http({method: 'GET', url: '/scores/scorelist'});
  var getConfig = $http({method: 'GET', url: '/config/configdata'});
  var getPax = $http({method: 'GET', url: '/config/paxvalues'});
  $q.all([getPrefixes, getConfig, getPax]).then(function(data) {
    // parse configdata
    if (data[1].data.paxCones.toUpperCase() === 'YES') { $scope.paxCones = true; }
    else { $scope.paxCones = false; }
    // parse paxvalues
    $scope.paxValues = data[2].data;
    // parse prefixes
    $scope.dates = _.sortBy(data[0].data, function(date) { return date.Prefix; });
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
    
    $scope.loading = false;
  });
  
  $scope.hasData = function() {
    return !_.isUndefined($scope.results) && $scope.results.length > 0;
  };
  $scope.dateSelected = function() {
    if (!_.isUndefined($scope.selectedDate)) {
      $http({method: 'GET', url: '/scores/scoresbyprefix?prefix='+$scope.selectedDate.Prefix})
      .success(function(data, status, headers, config) {
        var days = [];
        var processedRuns = {};
        _.each(data.Runs, function(run) {
          if (_.isUndefined(processedRuns[run.number])) {
            processedRuns[run.number] = [];
          }
          processedRuns[run.number].push(run);
          if (days.indexOf(run.day) === -1) {
            days.push(run.day);
          }
        });
        $scope.days = days;
        // only include drivers with runs
        $scope.results = _.map(_.filter(data.Drivers, function(driver) {
            return (!_.isUndefined(processedRuns[driver.number]));
          }), function(driver) { 
            return mapRunsToDriver(driver, processedRuns); 
          });
      });
    }
  };
});