// required bits
var path = require('path');
var fs = require('fs');
var express = require('express');
var parseArgs = require('minimist');
var _ = require('underscore');
var scoreRouter = express.Router();
var configRouter = express.Router();
var converter = require('csvtojson').core.Converter;


// command line arguments
var mjtimingdir = parseArgs(process.argv.slice(2))['datadir'] || 'c:\\mjtiming\\';
var eventDataDir = mjtimingdir + 'eventdata\\';
var conesGetPAXed = false;
var classData = [];
var configPath = mjtimingdir + 'config\\';
var classDataPath = configPath + '_classData.csv';
var port = parseArgs(process.argv.slice(2))['port'] || 80;

// globals
var scoreData = {};
var configData = {};

var addDriverData = function(driverData, prefix) {
  scoreData[prefix] = {Drivers: driverData, Runs: []};
};

var setScoreData = function(scoresData, prefix) {
  if (!_.isUndefined(scoreData[prefix])) {
    scoreData[prefix].Runs = scoresData;
  }
};


var mapCsvDriverToJsonDriver = function(driver) {
  return {
    number: driver["Number"],
    car: driver["Car Model"],
    class: driver["Class"],
    member: driver["Member"],
    rookie: driver["Rookie"],
    driver: driver["First Name"] + ' ' + driver["Last Name"].substring(0, 1)
  };
};

var mapCsvScoreToJsonScore = function(score) {
  return {
    number: score["car_number"],
    day: parseInt(score["day"]),
    penalty: score["penalty"],
    run: parseInt(score["run_number"]),
    time: parseFloat(score["run_time"])
  };
};

var parseScoreFile = function(prefix) {
  var path = eventDataDir + prefix + '_timingData.csv';
  var scoresCsvConverter = new converter({});
  var scoresFileStream = fs.createReadStream(path, {flags: 'r'});
  scoresFileStream.on('error', function(error) {
    console.log('no score files found for "' + prefix + '"');
  });
  scoresFileStream.on('readable', function() {
    scoresCsvConverter.on("end_parsed", function(scoresJsonObj) {
      var scoresData = _.map(scoresJsonObj, mapCsvScoreToJsonScore);
      setScoreData(scoresData, prefix);
    });
    scoresFileStream.pipe(scoresCsvConverter);
  });
};

var parseEventFiles = function(prefix) {
  var driverFileStream = fs.createReadStream(eventDataDir + prefix + '_driverData.csv');
  var driverCsvConverter = new converter({});
  driverCsvConverter.on("end_parsed", function(driverJsonObj) {
    var driverData = _.map(driverJsonObj, mapCsvDriverToJsonDriver);
    addDriverData(driverData, prefix);
    parseScoreFile(prefix);
  });
  driverFileStream.pipe(driverCsvConverter);
};

var refreshScoreData = function() {
  var matchRegex = new RegExp('_driverData.csv$');
  _.each(_.map(_.filter(fs.readdirSync(eventDataDir), function(path) {
         return matchRegex.test(path);
      }), function(path) {
       return path.replace(/_driverData.csv$/,'');
    }), function(prefix) {
     parseEventFiles(prefix);
   });
};

var loadClasses = function() {
  var classFileStream = fs.createReadStream(classDataPath);
  var classCsvConverter = new converter({});
  classCsvConverter.on("end_parsed", function(classJsonObj) {
    var classes = _.object(_.map(classJsonObj, function(classItem) { 
      return [classItem.Class, {pax: classItem.PAX, description: classItem.Description, group: classItem.Group, displayOrder: classItem["Display Order"]}];
    }));
    classData = classes;
  });
  classFileStream.pipe(classCsvConverter);
};

var loadConfigData = function() {
  var configFileStream = fs.createReadStream(configPath + 'configData.csv');
  var configCsvConverter = new converter({});
  configCsvConverter.on("end_parsed", function(configJsonObj) {
    var config = _.object(_.map(configJsonObj, function(configItem) { return [configItem.Parameter, configItem.Value];}));
    conesGetPAXed = config.ConesGetPAXed;
    eventDataDir = config.eventDataFolder + '\\';
    classDataPath = config.classDataFile;
    loadClasses();
    refreshScoreData();
  });
  configFileStream.pipe(configCsvConverter);
};

// define the router

scoreRouter.get('/scorelist', function(req, res, next) {
  res.send(_.map(_.keys(scoreData), function(key) { return {Prefix: key, Has: _.keys(scoreData[key])};}));
});
scoreRouter.get('/scoresbyprefix', function(req, res, next) {
  var prefix=req.query.prefix;
  var scores = {};
  if (!_.isUndefined(prefix) && !_.isUndefined(scoreData[prefix])) {
    scores = scoreData[prefix];
  }
  res.send(scores);
});
configRouter.get('/configdata', function(req, res, next) {
  res.send({paxCones: conesGetPAXed});
});
configRouter.get('/paxvalues', function(req, res, next) {
  res.send(classData);
});
// define the app object itself

var app = express();

app.use("/lib", express.static(path.join(__dirname, 'bower_components')));
app.use("/scores", scoreRouter);
app.use("/config", configRouter);
app.use("/", express.static(path.join(__dirname,'public')));

// start up the server

app.listen(port);

// maybe we should refactor and have this fire a callback to bring up the server once the scores are ready

loadConfigData();