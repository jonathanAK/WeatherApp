var http = require('http');
var fs = require('fs');
var url = require('url');
var fetchA = require('node-fetch');
// const Cache = require('./cache.js');
var port = 3000;
// const cache = new Cache;
var contentTypes = new Map();
contentTypes.set('html', 'text/html');
contentTypes.set('htm', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('png', 'image/png');
contentTypes.set('jpg', 'image/jpg');
http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    if (q.pathname.substr(0, 5).toLowerCase() != "/api/") {
        var fileName = (q.pathname === '/' ? 'index.html' : q.pathname.substr(1));
        var fileExt = fileName.split('.').pop();
        var contentType_1 = contentTypes.get(fileExt);
        fs.readFile("public/" + fileName, function (err, data) {
            if (err || !contentType_1) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType_1 });
                res.write(data);
            }
            res.end();
        });
    }
    else {
        var callAddress = q.path.substr(5).toLowerCase();
        fetchA(callAddress)
            .then(function (r) { return r.text(); })
            .then(function (body) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(body);
            res.end();
        });
    }
}).listen(port, function () {
    console.log('Client is available at http://localhost:' + port);
});
