const http = require('http');
const path = require('path');
const fs = require('node:fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  if (pathname.includes('/')) {
    res.statusCode = 400;
    res.end('Forbidden. Nested paths are not allowed');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
  case 'DELETE':
    removeFile(res, filepath, pathname);
    break;

  default:
    res.statusCode = 501;
    res.end('Not implemented');
  }
});

function removeFile(res, filepath, pathname) {
  if (!hasAccess(filepath)) {
    res.statusCode = 404;
    res.end(`File ${pathname} not found`);
    return;
  }

  fs.rm(filepath, (err) => {
    if (err) {
      console.log(`[Error] During the file "${pathname}" removing an error occurred: `, err.message);
      res.statusCode = 500;
      res.end('Internal server error. Something went wring during the file removing: ', pathname);
      return;
    }

    res.statusCode = 200;
    res.end(`File "${pathname}" has been successfully removed`);
  });
}

function hasAccess(filepath) {
  try {
    fs.accessSync(filepath);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = server;
