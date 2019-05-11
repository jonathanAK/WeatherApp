'use strict';
exports.__esModule = true;
var http = require("http");
var fs = require("fs");
var url = require("url");
var fetch = require('node-fetch');
var port = 3000;
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
        cache.fetch(callAddress)
            .then(function (b) { return b.text(); })
            .then(function (body) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(body);
            res.end();
        });
    }
}).listen(port, function () {
    console.log('Client is available at http://localhost:' + port);
});
//cache actions
var cache = {
    timeOut: 3600000,
    cacheMem: {},
    hash: function (str) {
        var hash = '0';
        var i;
        var chr;
        if (str.length === 0)
            return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = '0' + (chr % 8) + hash + chr;
            hash = (parseInt(hash, 36) % 60446175).toString(36);
        }
        return hash;
    },
    fetch: function (call) {
        return new Promise(function (resolve, reject) {
            var hash = cache.hash(call);
            if (cache.cacheMem.hasOwnProperty(hash) && (Date.now() - cache.timeOut < cache.cacheMem[hash].time)) {
                resolve(cache.cacheMem[hash].value.clone());
            }
            else {
                resolve(fetch(call)
                    .then(function (response) {
                    cache.cacheMem[hash] = { time: Date.now(), value: response };
                    return (response.clone());
                }));
            }
        });
    }
};
