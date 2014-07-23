var http = require('http');
var path = require('path');
var fs = require('fs');
 
var extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"
};
 
function getFile(res,localFolder,fileName){
    var ext = path.extname(fileName);
    var filePath = localFolder + fileName;    
    if(!extensions[ext]){
		fs.readFile(localFolder + 'notsupported.html',function(err,contents){
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
            fs.readFile(page404,function(err,contents){
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
    var localFolder = __dirname + '/html/';
 
    getFile(res, localFolder, fileName);
};
 
http.createServer(requestHandler).listen(80);