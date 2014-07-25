var path = require('path');
var fs = require('fs');
var express = require('express');
var parseArgs = require('minimist');
var _ = require('underscore');
var router = express.Router();
var converter = require('csvtojson').core.Converter;

var filePath = 'd:\\mjtiming\\mjtiming\\eventdata\\';
var csvPath = filePath + 'test.csv';
var scoreData = {};

var addScores = function(scores, prefix) {
  scoreData[prefix] = scores;
};

var parseScoreFiles = function(prefix) {
  var driverFileStream = fs.createReadStream(filePath + prefix + '_driverData.csv');
  var driverCsvConverter = new converter({});
  driverCsvConverter.on("end_parsed", function(driverJsonObj) {
    var path = filePath + prefix + '_timingData.csv';
    var scoresCsvConverter = new converter({});
    var scoresFileStream = fs.createReadStream(path, {flags: 'r'});
    scoresFileStream.on('error', function(error) {
      addScores({Drivers: driverJsonObj}, prefix);
    });
    scoresFileStream.on('readable', function() {
      scoresCsvConverter.on("end_parsed", function(scoresJsonObj) {
        addScores({Drivers: driverJsonObj, Scores: scoresJsonObj}, prefix);
      });
      scoresFileStream.pipe(scoresCsvConverter);
    });
  });
  driverFileStream.pipe(driverCsvConverter);
};

var refreshScoreData = function() {
  var matchRegex = new RegExp('_driverData.csv$');
  _.each(_.map(_.filter(fs.readdirSync(filePath), function(path) {
         return matchRegex.test(path);
      }), function(path) {
       return path.replace(/_driverData.csv$/,'');
    }), function(prefix) {
     parseScoreFiles(prefix);
   });
};
// Pull port from command line argument, if present
port = parseArgs(process.argv.slice(2))['port'] || 80;

router.use(function(req,res,next) {
  next();
});
router.get('/scorelist', function(req, res, next) {
  res.send(_.map(_.keys(scoreData), function(key) { return {Prefix: key, Has: _.keys(scoreData[key])};}));
});
router.get('/scoresbyprefix', function(req, res, next) {
  var prefix=req.query.prefix;
  if (_.isUndefined(req.query.prefix) || _.isUndefined(scoreData[prefix])) {
    res.send({});
  } else {
  res.send(scoreData[prefix]);
  }
});

var app = express();

app.use("/lib", express.static(path.join(__dirname, 'bower_components')));
app.use("/scores", router);
app.use("/", express.static(path.join(__dirname,'public')));
app.listen(port);
refreshScoreData();
