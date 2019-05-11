const http = require('http');
const fs = require('fs');
const url = require('url');
const fetchA = require('node-fetch');
// const Cache = require('./cache.js');

const port = 3000;
// const cache = new Cache;

const contentTypes = new Map();
contentTypes.set('html', 'text/html');
contentTypes.set('htm', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('png', 'image/png');
contentTypes.set('jpg', 'image/jpg');

http.createServer(function (req, res) {
    const q = url.parse(req.url, true);
    if (q.pathname.substr(0, 5).toLowerCase() != "/api/") {
        const fileName = (q.pathname === '/'?'index.html':q.pathname.substr(1));
        const fileExt = fileName.split('.').pop();
        const contentType = contentTypes.get(fileExt);
            fs.readFile("public/" + fileName, function (err, data) {
                if (err || !contentType) {
                    res.writeHead(404,{'Content-Type': 'text/plain'});
                } else {
                    res.writeHead(200, {'Content-Type': contentType});
                    res.write(data);
                }
                res.end();
            });
    }else{
        const callAddress = q.path.substr(5).toLowerCase();
        fetchA(callAddress)
            .then(r => r.text())
            .then(body => {
                res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(body);
                    res.end();
            });
    }
}).listen(port, function () {
    console.log('Client is available at http://localhost:' + port);
});