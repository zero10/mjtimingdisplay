var path = require('path');
var fs = require('fs');
var express = require('express');
var parseArgs = require('minimist');
var router = express.Router();
 
// Pull port from command line argument, if present
port = parseArgs(process.argv.slice(2))['port'] || 80;

router.use(function(req,res,next) {
  next();
});
router.get('/scorelist', function(req, res, next) {
  res.send('score list');
});
router.get('/scoresbyprefix', function(req, res, next) {
  res.send('scores by prefix');
});

var app = express();


app.use("/lib", express.static(path.join(__dirname, 'bower_components')));
app.use("/scores", router);
app.use("/", express.static(path.join(__dirname,'public')));
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.listen(port);
