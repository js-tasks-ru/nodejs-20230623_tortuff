const http = require('http');
const path = require('path');
const fs = require('node:fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  if (pathname.includes('/')) {
    res.statusCode = 400;
    res.end('Incorrect path');
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      readFileFrom(res, filepath);
      break;

    default:
      res.statusCode = 500;
      res.end('Internal server error');
  }
});

function readFileFrom(res, filepath) {
  const readStream = fs.createReadStream(filepath);

  readStream.on('error', err => {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
      res.end(err.message);
    } else {
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  server.on('close', () => readStream.close());

  readStream.pipe(res);
}

module.exports = server;
