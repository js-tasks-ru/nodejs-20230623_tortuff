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
    return;
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

  req.on('close', () => {
    if (!writeStream.writableEnded) {
      writeStream.end();
      removeFile(filepath);
    }
  });

  limitStream.on('error', (err) => {
    writeStream.destroy();
    removeFile(filepath);

    if (err instanceof LimitExceededError) {
      res.statusCode = 413;
      res.statusMessage = `The file "${filename}" is bigger than 1MB`;
    } else {
      res.statusCode = 500;
      res.statusMessage = 'Internal server error';
    }

    req.on('end', () => res.end());
    req.resume();
  });

  writeStream.on('finish', () => {
    res.statusCode = 201;
    res.end(`The file "${filename}" has been successfully uploaded`);
  });

  req.pipe(limitStream).pipe(writeStream);
}

function removeFile(filepath) {
  if (!hasAccess(filepath)) return;

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
