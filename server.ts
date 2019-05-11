'use strict';
import http = require('http');
import fs = require('fs');
import url = require('url');
import {Body} from "node-fetch";

const fetch = require('node-fetch');

const port = 3000;

const contentTypes = new Map();
contentTypes.set('html', 'text/html');
contentTypes.set('htm', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('png', 'image/png');
contentTypes.set('jpg', 'image/jpg');

http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse) {
    const q: url.Url = url.parse(req.url, true);
    if (q.pathname.substr(0, 5).toLowerCase() != "/api/") {
        const fileName: string = (q.pathname === '/' ? 'index.html' : q.pathname.substr(1));
        const fileExt: string = fileName.split('.').pop();
        const contentType: string = contentTypes.get(fileExt);
        fs.readFile("public/" + fileName, function (err: Error | null, data: string | Buffer): void {
            if (err || !contentType) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
            } else {
                res.writeHead(200, {'Content-Type': contentType});
                res.write(data);
            }
            res.end();
        });
    } else {
        const callAddress: string = q.path.substr(5).toLowerCase();

        cache.fetch(callAddress)
            .then((b: Body) => b.text())
            .then((body: string) => {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(body);
                res.end();
            });
    }
}).listen(port, function () {
    console.log('Client is available at http://localhost:' + port);
});

//cache actions
const cache = {
    timeOut: 3600000,
    cacheMem: {},

    hash: (str): string => {
        let hash = '0';
        let i: number;
        let chr: number;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = '0' + (chr % 8) + hash + chr;
            hash = (parseInt(hash, 36) % 60446175).toString(36);
        }
        return hash;
    },

    fetch: (call): Promise<Body> => {
        return new Promise((resolve, reject) => {
            let hash: string = cache.hash(call);
            if (cache.cacheMem.hasOwnProperty(hash) && (Date.now() - cache.timeOut < cache.cacheMem[hash].time)) {
                resolve(cache.cacheMem[hash].value.clone());
            } else {
                resolve(
                    fetch(call)
                        .then((response): string => {
                            cache.cacheMem[hash] = {time: Date.now(), value: response};
                            return (response.clone());
                        })
                );
            }
        });
    }
};