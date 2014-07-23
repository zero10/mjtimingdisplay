var http = require('http');
var path = require('path');
var fs = require('fs');
var parseArgs = require('minimist');
 
var extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"
};
 
function getFile(res,localFolder,dirName,fileName){
    var ext = path.extname(fileName);
    var filePath = localFolder + dirName + '/' + fileName;  
    if(!extensions[ext]){
		fs.readFile(localFolder + '/notsupported.html',function(err,contents){
            if(!err){
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end(contents);
            } else {
                console.dir(err);
            };
        });
    };
    
    fs.exists(filePath,function(exists){
        if(exists){
            fs.readFile(filePath,function(err,contents){
                if(!err){
                    res.writeHead(200,{
                        "Content-type" : extensions[ext],
                        "Content-Length" : contents.length
                    });
                    res.end(contents);
                } else {
                    console.dir(err);
                };
            });
        } else {
            fs.readFile(localFolder + '/404.html',function(err,contents){
                if(!err){
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(contents);
                } else {
                    console.dir(err);
                };
            });
        };
    });
};
 
function requestHandler(req, res) {
    var fileName = path.basename(req.url) || 'index.html';
    if (fileName.toUpperCase() === 'APP.JS') { fileName = 'index.html';}
    var localFolder = __dirname;
    getFile(res, localFolder, path.dirname(req.url), fileName);
};

// Pull port from command line argument, if present
port = parseArgs(process.argv.slice(2))['port'] || 80
 
http.createServer(requestHandler).listen(port);
