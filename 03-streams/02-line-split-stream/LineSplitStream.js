const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.encoding = options.encoding;
    this.buffer = undefined;
  }

  _transform(chunk, encoding, callback) {
    const data = encoding === 'buffer' ? chunk.toString(this.encoding) : chunk;
    const subchunks = data.split(String(os.EOL));
    const nextEventChunk = subchunks.pop();

    subchunks.forEach(part => {
      if (this.buffer) {
        this.push(Buffer.from(this.buffer + part, this.encoding));
        this.buffer = undefined;
      } else {
        this.push(Buffer.from(part, this.encoding));
      }
    });

    if (nextEventChunk) {
      this.buffer = Boolean(this.buffer) ? this.buffer + nextEventChunk : nextEventChunk;
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      callback(null, Buffer.from(this.buffer, this.encoding));
    } else {
      callback();
    }
  }
}

module.exports = LineSplitStream;
