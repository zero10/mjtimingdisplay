var http = require('http');
var path = require('path');
var fs = require('fs');
var express = require('express');
var parseArgs = require('minimist');
 
// Pull port from command line argument, if present
port = parseArgs(process.argv.slice(2))['port'] || 80
var app = express();
//http.createServer(requestHandler).listen(port);
var http = require('http').Server(app);
app.use("/lib", express.static(path.join(__dirname, 'bower_components')));
app.use("/", express.static(path.join(__dirname,'public')));
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.listen(port);
