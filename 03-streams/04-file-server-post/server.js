const http = require('http');
const path = require('path');
const fs = require('node:fs');

const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const filesDirPath = path.join(__dirname, 'files');

if (!hasAccess(filesDirPath)) {
  fs.mkdirSync(filesDirPath);
}

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filename = url.pathname.slice(1);

  if (filename.includes('/')) {
    res.statusCode = 400;
    res.end('Incorrect path');
  }

  switch (req.method) {
    case 'POST':
      createFile(req, res, filename);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

function createFile(req, res, filename) {
  const filepath = path.join(__dirname, 'files', filename);

  if (hasAccess(filepath)) {
    res.statusCode = 409;
    res.end(`File ${filename} already exists`);
    return;
  }

  const writeStream = fs.createWriteStream(filepath);
  const limitStream = new LimitSizeStream({ limit: 1024 * 1024 });

  req.on('close', () => removeFile(filepath));
  writeStream.on('finish', () => res.end('The file has been successfully uploaded'));

  limitStream.on('error', (err) => {
    if (err instanceof LimitExceededError) {
      res.statusCode = 413;
      res.end(`The file "${filename}" is bigger than 1MB`);
    } else {
      res.statusCode = 500;
      res.end(`Internal server error`);
    }

    removeFile(filepath);
    limitStream.end();
  });

  req.pipe(limitStream).pipe(writeStream);
}

function removeFile(filepath) {
  fs.rm(filepath, (err) => {
    if (err) {
      console.log(`[ERROR] Error occurred during the file removing: ${err.message}`);
    }
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
