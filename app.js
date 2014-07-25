var path = require('path');
var fs = require('fs');
var express = require('express');
var parseArgs = require('minimist');
var router = express.Router();
var converter = require('csvtojson').core.Converter;


var csvPath = 'd:\\test.csv';
router.use(function(req,res,next) {
  next();
});
router.get('/scorelist', function(req, res, next) {
  var scoreDates = ['2014_01_01', '2014_02_02', '2014_03_03'];
  res.send(scoreDates);
});
router.get('/scoresbyprefix', function(req, res, next) {
  res.sendfile(csvPath);
  /*var fileStream = fs.createReadStream(csvPath);
  var csvConverter = new Converter({});
  csvConverter.on("end_parsed", function(jsonObj) {
    res.send(jsonObj);
  });
  fileStream.pipe(csvConverter);*/
});

var app = express();

app.use("/lib", express.static(path.join(__dirname, 'bower_components')));
app.use("/scores", router);
app.use("/", express.static(path.join(__dirname,'public')));

// Pull port from command line argument, if present
port = parseArgs(process.argv.slice(2))['port'] || 80;

app.listen(port);
